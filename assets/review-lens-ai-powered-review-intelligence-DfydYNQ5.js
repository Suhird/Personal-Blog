const e=`# ReviewLens: AI-Powered Consumer Review Intelligence, Running 100% Locally

Stop trusting star ratings. Here's how to build a system that reads thousands of reviews for you — detecting fake ones, spotting quality drift, and surfacing what real buyers actually care about.

## The Problem with Modern Product Reviews

Buying a product online in 2026 means wading through thousands of reviews, many of which are fake, incentivized, or just noise. Star ratings are gamed. Review counts are inflated. A product with 4.7 stars and 3,000 reviews might have a 30% fake rate, declining quality over the last six months, and a recurring complaint buried 40 pages deep that nobody reads.

The fundamental problem isn't a lack of data — it's that no tool synthesizes it intelligently. You're stuck manually scrolling, pattern-matching in your head, and making a decision based on vibes.

**ReviewLens** is my attempt to fix that. It's an AI-powered review intelligence engine that aggregates reviews from Amazon, Walmart, Best Buy, Costco, and YouTube, then runs a full analysis pipeline — fake detection, aspect sentiment, drift detection, theme clustering — and synthesizes a structured verdict, all running almost entirely on your local machine.

---

## What It Does

Type any product name. ReviewLens automatically:

- **Scrapes** Amazon, Walmart, Best Buy, Costco, and YouTube for real consumer opinions
- **Detects fake reviews** using Isolation Forest machine learning on 9 engineered features per review
- **Runs aspect-based sentiment analysis** — build quality, performance, value, battery life, etc. — using a locally-hosted LLM
- **Detects sentiment drift** over time: has quality been declining since that big firmware update six months ago?
- **Clusters reviews** into emergent themes using UMAP + HDBSCAN, named automatically by the LLM
- **Synthesizes a report** with a 0–10 verdict score, an executive summary, featured quotes, and who-should-buy/skip bullets

Everything streams progressively to a Next.js frontend as each stage completes. You can also cancel mid-pipeline and see partial results. A sidebar of demo products lets you explore pre-generated reports instantly.

---

## The Architecture

The pipeline is orchestrated by **LangGraph**, a framework for building stateful multi-agent graphs. Think of it as a directed graph where each node is an agent, and a shared state dictionary flows through them.

\`\`\`
                    user query
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
  enrich_query_node            scraper_node
  (LLM: 3–5 search             (parallel scrapers)
   variants + aliases)          ├─ Amazon (Playwright)
           │                    ├─ Gemini (Walmart /
           │                    │  Best Buy / Costco)
           │                    └─ YouTube (Data API)
           └────────────┬────────────┘
                        ▼
                 analysis_node
                 ├─ ABSA (LLM batches, sequential)
                 ├─ Fake detection (IsolationForest)
                 ├─ Drift detection (PELT)
                 └─ Clustering (UMAP + HDBSCAN)
                        │
                        ▼
                 synthesis_node
                 ├─ Programmatic score computation
                 └─ LLM: executive summary +
                    who-should-buy/skip bullets
                        │
                        ▼
                   FinalReport
             (cached in Redis, streamed
              to frontend via SSE)
\`\`\`

**Key pipeline detail:** \`enrich_query_node\` and \`scraper_node\` launch **in parallel** from START. Both must complete before \`analysis_node\` begins — so query enrichment and scraping happen simultaneously, saving significant time.

The entire pipeline is fault-tolerant. If Amazon blocks you, the pipeline continues with Gemini and YouTube data. If Ollama is slow, analysis degrades gracefully to fallback text. No node crashes the graph — exceptions are caught and appended to an \`errors\` list in the shared state.

---

## The Tech Stack

The project runs as four Docker Compose services, with Ollama running natively on the host machine:

| Service      | Tech                   | Role                                            |
| ------------ | ---------------------- | ----------------------------------------------- |
| **backend**  | Python 3.11, FastAPI   | Pipeline execution, REST + SSE API              |
| **postgres** | PostgreSQL + pgvector  | Long-term review storage with vector embeddings |
| **redis**    | Redis                  | Job state, 24hr report cache                    |
| **frontend** | Next.js 14, TypeScript | Report UI with Recharts + D3.js                 |
| **Ollama**   | llama3.2 (native)      | Local LLM for ABSA, query enrichment, synthesis |

Backend dependencies of note: \`langgraph\`, \`langchain-ollama\`, \`playwright\`, \`google-genai\`, \`sentence-transformers\`, \`umap-learn\`, \`hdbscan\`, \`ruptures\`, \`scikit-learn\`, \`asyncpg\`, \`httpx\`.

---

## Deep Dive: The Scrapers

Scraping in 2026 means fighting constant countermeasures. Each source required a different approach.

### Amazon (Playwright)

Amazon is the hardest. The classic trick of navigating to \`/product-reviews/{asin}\` no longer works for headless browsers — Amazon redirects to a sign-in wall. The fix: parse reviews embedded directly in the product page HTML. They're already there, inside \`div[data-hook='review']\` elements.

The scraper also sets \`--disable-blink-features=AutomationControlled\` and overrides \`navigator.webdriver = undefined\` to reduce bot fingerprinting.

\`\`\`python
await context.add_init_script(
    "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
)
\`\`\`

### Gemini + Google Search Grounding (Walmart, Best Buy, Costco)

Initially this project used a direct Best Buy scraper and the Google Custom Search JSON API. Both were removed — Best Buy's API rate-limits quickly and is fragile; Google Custom Search returned persistent 403 errors despite correct GCP configuration.

The replacement is more elegant: **Gemini 2.5 Flash with Google Search grounding**. One API call to Gemini, with Google Search attached as a tool, retrieves and synthesizes reviews from walmart.com, bestbuy.com, and costco.com in a single shot.

There are two non-obvious constraints that shaped the implementation:

**1. No verbatim quoting.** If you ask Gemini to "quote reviews from these sites verbatim," it returns \`FinishReason.RECITATION\` — the model blocks itself from reproducing copyrighted text. The fix: use "describe in your own words / paraphrase" in the prompt. This produces \`FinishReason.STOP\` and full results.

**2. Two-step approach.** When Google Search grounding is active, asking for JSON-only output suppresses the model's response entirely. The solution is a two-step call: step 1 uses grounding with a natural language prompt to get review prose, step 2 is a separate call *without* grounding to structure that prose into JSON.

\`\`\`python
# Step 1: grounded search → prose
search_tool = types.Tool(google_search=types.GoogleSearch())
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=search_prompt,
    config=types.GenerateContentConfig(tools=[search_tool])
)

# Step 2: structure prose → JSON (no grounding)
structured = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=structure_prompt.format(prose=response.text)
)
\`\`\`

A Redis counter (\`gemini:calls:YYYY-MM-DD\`, 25hr TTL) enforces a configurable daily call cap (\`GEMINI_DAILY_CALL_LIMIT=20\`) to prevent runaway API charges. At 2 calls per product search, the default cap allows ~10 product searches per day at roughly $0.35/day maximum.

### YouTube (Data API v3)

Review video comments are underrated as a data source. People who comment on review videos have often already bought the product or are deciding whether to. The YouTube Data API v3 is free (10,000 units/day) and returns structured JSON with like counts and timestamps.

---

## Deep Dive: The Analysis Pipeline

### 1. Aspect-Based Sentiment Analysis (ABSA)

ABSA goes beyond "positive" or "negative". It asks: _what are people happy or unhappy about, specifically?_

Reviews are sampled (up to 45 from the full corpus, stratified by source) and batched in groups of 15. Each batch is sent to Ollama **sequentially** — not concurrently — because Ollama processes one request at a time anyway, and concurrent submissions cause queue pile-ups that dramatically increase total wait time.

The LLM assigns each aspect (build quality, performance, value, battery life, etc.) a sentiment label and a score from 0–1, counting mentions across reviews.

Results from all batches are merged: scores are averaged, sentiments use majority vote.

### 2. Fake Review Detection

The fake detector uses scikit-learn's \`IsolationForest\` — an unsupervised anomaly detection model — trained on 9 engineered features per review:

| Feature                 | Why It Matters                                            |
| ----------------------- | --------------------------------------------------------- |
| \`text_length\`           | Very short or suspiciously long reviews are anomalies     |
| \`exclamation_count\`     | Fake reviews over-use exclamation points                  |
| \`caps_ratio\`            | Excessive capitalization signals incentivized writing     |
| \`generic_praise_score\`  | Keyword match: "amazing", "perfect", "love it", "5 stars" |
| \`verified_purchase\`     | Unverified purchases are higher risk                      |
| \`helpful_votes\`         | Real reviews get upvoted; fake ones don't                 |
| \`days_since_posting\`    | Review date relative to corpus median                     |
| \`reviewer_review_count\` | Reviewers with only one review in the corpus are suspect  |
| \`burst_score\`           | Multiple reviews from same reviewer within 7 days         |

\`contamination=0.1\` means the model assumes ~10% of reviews are anomalous. Scores above 0.7 are flagged. Risk levels: low (< 15% flagged), medium (< 35%), high (≥ 35%).

One interesting edge case: Gemini-sourced reviews (from Walmart/Best Buy/Costco) score artificially high on IsolationForest because they have no \`verified_purchase\`, \`helpful_votes=0\`, and \`reviewer_id=None\` — their uniform zero-valued features cluster together and look anomalous. The featured review selector handles this with a two-tier filter: a diversity pass at \`fake_score < 0.7\` ensures every source gets at least one featured review, and a quality fill pass at \`fake_score < 0.4\` fills remaining slots.

### 3. Sentiment Drift Detection

A product's reviews from 2023 might tell a different story than its reviews from 2025. Firmware updates, supplier changes, and quality-control issues all leave fingerprints in the review timeline.

The drift detector groups reviews by year-month, normalizes star ratings to 0–1, then runs the PELT (Pruned Exact Linear Time) change-point detection algorithm from the \`ruptures\` library. Change points are months where the sentiment signal shifts meaningfully. Trend direction (improving / declining / stable) is computed by comparing the first 3 months' average against the last 3.

### 4. Theme Clustering

What are people actually talking about? Clustering finds emergent themes without needing predefined categories.

The pipeline: generate 384-dim sentence embeddings with \`all-MiniLM-L6-v2\` (local, no API) → reduce to 5 dimensions with UMAP → cluster with HDBSCAN → ask Ollama to name each cluster in 3–5 words.

The result might be: "Excellent Noise Cancellation", "Battery Life Issues", "Comfortable for Long Wear", "Latency with Gaming". These are discovered from the data, not hardcoded.

---

## The Verdict Score

The overall score is computed programmatically — no LLM in the loop, just arithmetic:

\`\`\`python
base_score = (avg_rating - 1.0) / 4.0 * 10.0   # normalise 1–5 stars → 0–10
fake_penalty = min(fake_percentage / 100.0 * 0.1 * 10.0, 1.0)
drift_bonus = +0.3 if improving else -0.3 if declining else 0.0

overall = clamp(base_score - fake_penalty + drift_bonus, 0.0, 10.0)
\`\`\`

Then Ollama writes the executive summary and who-should-buy/skip bullets based on all the structured analysis outputs.

---

## LLM Performance Tuning: Taming Ollama on an M2 MacBook

This was one of the trickiest parts of the project to get right, and worth documenting in detail.

### The Problem: Context Window vs. Memory

By default, llama3.2 loads with a 4,096-token context window, allocating **448 MB of KV cache** on the GPU. On an M2 MacBook Air with 8–16 GB of unified memory shared between CPU and GPU, this caused two compounding problems:

**Context overflow:** ABSA batches (prompt template + 25 reviews × 500 chars each) were hitting the 4,096-token limit. When prompt + generated output exceeded the window, Ollama would truncate the response mid-JSON — producing invalid output, triggering a retry, and turning a 20-second call into a 5+ minute one.

**Thermal throttling:** After running heavy LLM inference for an extended session, the M2 would throttle. The symptom was progressive slowdown: batch 1 = 1m 38s, batch 2 = 3m 38s, batch 3 = never completing. Restarting Ollama between searches reset the thermal state.

### The Fixes

**1. Reduce context window to 2,048 tokens (\`num_ctx=2048\`)**

Halves the KV cache from 448 MB → 224 MB. Less memory pressure, less thermal load, faster prefill. All LLM calls now instantiate \`ChatOllama\` with explicit parameters:

\`\`\`python
# ABSA batches
llm = ChatOllama(model=settings.ollama_model, num_ctx=2048, num_predict=800)

# Query enrichment (just a short JSON array)
llm = ChatOllama(model=settings.ollama_model, num_ctx=2048, num_predict=128)

# Synthesis (executive summary + bullets)
llm = ChatOllama(model=settings.ollama_model, num_ctx=2048, num_predict=400)
\`\`\`

**2. Reduce review text per batch**

Cut review text truncation from 500 → 150 chars per review, and batch size from 25 → 15 reviews. Each ABSA prompt now uses approximately:
- Input: ~700 tokens (15 reviews × 150 chars + prompt overhead)
- Output: ~150 tokens (10 aspects × 4 short fields)
- **Total: ~850 tokens** — well within the 2,048 window

**3. Run ABSA batches sequentially**

Changed from \`asyncio.gather(*tasks)\` to a sequential loop. Ollama can only process one LLM request at a time — concurrent submissions just create a queue where each request's timeout clock runs simultaneously. Sequential execution gives the same total throughput with predictable timing.

**4. Remove the \`representative_quote\` field from ABSA output**

Asking the model to produce verbatim quote strings for each aspect was the biggest token consumer — each quote could be 50–100 tokens, pushing output well past \`num_predict=800\` and causing truncation → retry loops. Removing the field cut expected output from ~800 tokens to ~150 tokens per batch.

### Results

After all fixes, with a fresh Ollama session on M2 MacBook Air:

| Step | Before | After |
|------|--------|-------|
| ABSA batch (each) | 5–6 minutes | **18–24 seconds** |
| Full ABSA (3 batches) | 15–18 minutes | **~60 seconds** |
| Synthesis calls | 4–5 minutes each | **~12 seconds** |

### Scaling Up on More Powerful Hardware

If you run this on a machine with more RAM/VRAM, increase these values for better analysis quality:

**M2 Pro / M3 / M4 (16–32 GB RAM):**
\`\`\`python
llm = ChatOllama(model=..., num_ctx=4096, num_predict=1024)
\`\`\`
Also restore batch size to 25 reviews and text truncation to 300 chars.

**Cloud GPU (A100, H100, 24+ GB VRAM):**
\`\`\`python
llm = ChatOllama(model=..., num_ctx=8192, num_predict=2048)
\`\`\`
Switch to a larger model for significantly better report quality:
\`\`\`bash
OLLAMA_MODEL=mistral        # 7B — good balance
OLLAMA_MODEL=mixtral        # 47B MoE — best quality, needs 32+ GB RAM
OLLAMA_MODEL=llama3.1:70b   # excellent, needs 48+ GB VRAM
\`\`\`

**Memory rule of thumb:** KV cache ≈ \`num_ctx × num_layers × head_dim × 4 bytes / 1024³\` GB. For llama3.2:3b at \`num_ctx=4096\`: ~448 MB. At \`num_ctx=2048\`: ~224 MB. Plan accordingly.

---

## Running It Locally

Requirements: Docker Desktop and ~4–6 GB of free disk for the llama3.2 model. A Gemini API key is required for Walmart/Best Buy/Costco reviews (free tier won't work — billing must be enabled, but cost is capped at ~$0.35/day with the built-in daily limit).

\`\`\`bash
git clone https://github.com/your-username/review-lens.git
cd review-lens
cp .env.example .env
# Fill in GEMINI_API_KEY in .env (required)
# Fill in YOUTUBE_API_KEY in .env (optional, free)
./init.sh
\`\`\`

\`init.sh\` starts Ollama first, pulls the llama3.2 model (~2 GB, one-time), then starts all Docker services. Open \`http://localhost:3000\`.

Analysis time on an M2 MacBook Air with the tuned settings: **~5–8 minutes** for a live product search. The home page sidebar shows demo products with pre-generated reports that load instantly.

---

## What I Learned

**LangGraph's fault tolerance model is excellent for pipelines like this.** The \`return_exceptions=True\` pattern in \`asyncio.gather\` combined with per-node try/except means you always get _something_ back, even when scraping is unreliable.

**Unsupervised methods are underrated for consumer problems.** Isolation Forest and HDBSCAN require no labeled training data — they find structure in whatever reviews you give them. This makes the system generalizable to any product without retraining.

**YouTube comment sections are underutilized.** Amazon reviews are gamed and surface sanitized opinions. YouTube comment sections under review videos contain real purchase decisions, failure stories, and nuanced comparisons that structured review platforms don't capture. In most searches, YouTube contributes 80%+ of the total review corpus.

**Local LLMs need careful prompt budgeting.** Unlike cloud APIs where you just throw tokens at the problem, running llama3.2 on a laptop requires treating the context window like a constrained resource. The difference between a 25-review batch with 500-char truncation and a 15-review batch with 150-char truncation was the difference between a 5-minute hang and an 18-second response.

**The Gemini two-step pattern is genuinely useful.** Using Gemini with Google Search grounding for the first pass (natural language prose), then a separate ungrounded call for structured extraction, bypasses both the RECITATION block and the grounding-suppresses-JSON-output issue. It's a clean pattern for any use case where you need to ground-search and then structure the results.

**Reddit API is effectively closed to indie developers.** Reddit locked down API access in 2023. The manual approval process for personal projects is rarely granted. The scraper was removed entirely rather than left as broken infrastructure.

---

## What's Next

- **Pre-Analysis** — Using OpenClaw to send message via Telegram or WhatsApp to trigger the analysis
- **Browser extension** — inject the ReviewLens verdict directly into Amazon product pages while you browse
- **Amazon PA-API integration** — the official Amazon Product Advertising API is free with an Associates account and gives structured review data without scraping
- **Comparison mode** — analyze two products side by side with a diff view of aspect scores
- **Cloud deployment** — with a larger Ollama model (Mistral 7B or Mixtral) on a GPU instance, analysis time drops to under 2 minutes and quality improves significantly

The full source is on GitHub. The home page includes several demo products with pre-generated reports if you want to explore the UI without running the full pipeline.
`;export{e as default};
