# Ultimate Guide to Dockerfile Optimization

Last week I cloned a project that had a 1.2GB Docker image. *One point two gigabytes.* For a simple REST API. I waited three minutes for it to download, then spent another two minutes fighting with disk space.

That's when I decided to actually learn how to write good Dockerfiles. Not just "it works" Dockerfiles — lean, fast, secure ones.

Here's everything I learned, using a real FastAPI project as our example.

## The Example Project

Our app is a simple FastAPI service:

```
myapp/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── utils.py
├── requirements.txt
├── .dockerignore
└── Dockerfile
```

```python
# app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

```text
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
httpx==0.26.0
```

## The Naive Dockerfile

Most people start like this:

```dockerfile
FROM python:3.12
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

This works. But it creates a **1.2GB image**. Let's fix that.

## 1. Use Smaller Base Images

Python has two smaller variants most people don't know about:

- `python:3.12-slim` — Minimal Python, no man pages, no docs (~150MB)
- `python:3.12-alpine` — Alpine Linux based, even smaller (~50MB), but watch for compatibility issues

For production, I use `python:3.12-slim-bookworm` (Debian stable) when I need compatibility, and `python:3.12-alpine` when I'm confident there are no C-extension issues.

```dockerfile
# Still naive, but smaller base
FROM python:3.12-slim
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

Down to ~400MB. We're getting there.

## 2. Multi-Stage Builds

This is the biggest win. Use one container to build, another to run.

```dockerfile
# Stage 1: Build
FROM python:3.12-slim AS builder
WORKDIR /app

# Install build dependencies first (layer caching!)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Copy source
COPY app/ ./app/

# Stage 2: Production image
FROM python:3.12-slim

WORKDIR /app

# Copy only what we need from builder
COPY --from=builder /install /usr/local
COPY --from=builder /app /app

# Run as non-root
RUN useradd --create-home appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

Down to ~250MB. And we don't have compilers in production.

## 3. Order Matters for Cache Efficiency

Docker caches each layer. If a layer changes, all subsequent layers are rebuilt. Structure your Dockerfile so things that change infrequently come first:

```dockerfile
# Good: Dependencies change rarely, source changes often
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/

# Bad: Every code change reinstalls all dependencies
COPY . .
RUN pip install -r requirements.txt
```

The order above is intentional:
1. `requirements.txt` copied first
2. Dependencies installed (cached unless requirements change)
3. Source code copied last (changes most frequently)

## 4. Combine RUN Commands

Each `RUN` creates a layer. Combine commands to reduce image size:

```dockerfile
# Bad: Creates multiple layers
RUN apt-get update
RUN apt-get install -y gcc
RUN rm -rf /var/lib/apt/lists/*

# Good: Single layer, cleaner output
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*
```

For Python, always use `--no-cache-dir` with pip:

```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

This prevents pip from caching downloaded packages inside the image, saving another 50-100MB.

## 5. Use .dockerignore

Just like `.gitignore`, this prevents files from being sent to the Docker daemon:

```dockerignore
# Git
.git
.gitignore

# Python
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
.eggs/
dist/
build/

# Virtual environments
venv/
.venv/
env/

# IDE
.vscode/
.idea/

# Testing
.pytest_cache/
.coverage
htmlcov/

# Documentation
*.md
docs/

# Docker
Dockerfile
docker-compose*.yml

# CI/CD
.github/
.gitlab-ci.yml
```

Without `.dockerignore`, you're sending your entire project to Docker — including `.git`, `node_modules`, and that 500MB video file you forgot to delete.

## 6. Install Only What You Need

Every dependency is a potential security vulnerability and increases image size:

```dockerfile
# Bad: Installs dev dependencies in production
RUN pip install -r requirements.txt

# Good: Only production dependencies
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
```

Your `requirements.txt` should distinguish between production and development:

```text
# requirements.txt (production only)
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0

# requirements-dev.txt
-r requirements.txt
pytest==7.4.0
black==23.12.0
```

Then in Dockerfile:
```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
```

## 7. Run as Non-Root

By default, containers run as root. This is a security risk.

```dockerfile
FROM python:3.12-slim

RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

# ... copy files, install deps ...

RUN chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "app.main:app"]
```

Now if someone compromises your app, they don't have root access to the container *or* the host.

## 8. Use Distroless Images (Advanced)

Google's distroless images contain only the application runtime — no shell, no package manager, no utilities:

```dockerfile
# Multi-stage with distroless
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY app/ ./app/

FROM gcr.io/distroless/python3-debian12

COPY --from=builder /install /usr/local
COPY --from=builder /app /app

USER 1000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

Result: ~80MB image with no shell. Harder to exploit, smaller attack surface.

## 9. Health Checks

Add a health check so orchestration tools (Kubernetes, Docker Compose) know when your app is ready:

```dockerfile
FROM python:3.12-slim

# ... setup ...

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app"]
```

Your app needs a health endpoint for this to work:

```python
@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## 10. Build Arguments for Flexibility

Use `ARG` for things that change between environments:

```dockerfile
FROM python:3.12-slim

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Dev builds might want debug mode
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=debug

USER appuser

CMD ["uvicorn", "app.main:app"]
```

Build with:
```bash
docker build --build-arg APP_ENV=development -t myapp:dev .
```

## The Optimized Dockerfile (Final)

Here's the full optimized version for our FastAPI app:

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Builder
FROM python:3.12-slim AS builder

WORKDIR /app

# Build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Application code
COPY app/ ./app/

# Stage 2: Production
FROM python:3.12-slim

WORKDIR /app

# Create non-root user
RUN useradd --create-home --uid 1000 appuser

# Copy from builder
COPY --from=builder --chown=appuser:appuser /install /usr/local
COPY --from=builder --chown=appuser:appuser /app /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Size Comparison

| Approach | Image Size | Build Time |
|----------|-----------|------------|
| Naive (python:3.12) | 1.2GB | ~3 min |
| Slim base only | 400MB | ~2 min |
| Multi-stage | 250MB | ~2 min |
| + No cache, proper user | 220MB | ~90s |
| Distroless | 80MB | ~90s |

## Quick Checklist

Before shipping any Dockerfile:

- [ ] Using slim or alpine base image?
- [ ] Multi-stage build with no build tools in final image?
- [ ] `pip install --no-cache-dir`?
- [ ] Combined RUN commands?
- [ ] `.dockerignore` file?
- [ ] Running as non-root?
- [ ] Health check configured?
- [ ] Dependencies split between dev and prod?

That's it. A 1.2GB image down to 220MB isn't hard — it just takes knowing which knobs to turn.
