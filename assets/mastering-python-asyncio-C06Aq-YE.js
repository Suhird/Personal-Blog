const n=`# Mastering Python AsyncIO

AsyncIO is Python's answer to high-concurrency I/O operations. While traditional synchronous code waits idly for network responses, AsyncIO lets you handle thousands of simultaneous connections without spawning threads for each one.

## The Problem: Blocking I/O

Consider downloading images from an API. With synchronous \`requests\`:

\`\`\`python
import requests
import time

def download_images(urls):
    for url in urls:
        response = requests.get(url)  # Blocks until complete
        save_image(response.content)
\`\`\`

This is deeply inefficient. While your code waits for the server to respond, the CPU sits idle. If you're downloading 100 images at 200ms latency each, you're looking at 20+ seconds of pure waiting.

Threading seems like a solution, but Python's **Global Interpreter Lock (GIL)** makes threads fight over the same execution context. They can't truly run in parallel for CPU work, and for I/O they add significant overhead.

## AsyncIO: Cooperative Multitasking

AsyncIO uses a single-threaded event loop with **cooperative multitasking**. Think of a postman who doesn't wait at each door—they knock, leave a flyer, and move on. When someone answers, they come back.

\`\`\`python
import asyncio
import aiohttp

async def download_image(session, url, filename):
    """Download image non-blocking, save to disk"""
    try:
        async with session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                async with aiofiles.open(filename, "wb") as f:
                    await f.write(content)
                return filename
    except Exception as e:
        return None

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [
            download_image(session, url, f"image_{i}.jpg")
            for i, url in enumerate(urls)
        ]
        # Fire all requests concurrently, wait for all to complete
        results = await asyncio.gather(*tasks)
\`\`\`

## The \`async\` and \`await\` Keywords

An \`async def\` function is a **coroutine**—a function that can be paused and resumed. When you call an async function, it returns a coroutine object but doesn't execute:

\`\`\`python
async def fetch_data():
    return "data"

coro = fetch_data()  # Doesn't execute yet
result = await coro  # Now it runs
\`\`\`

The \`await\` keyword pauses your coroutine and gives control back to the event loop. While waiting, other coroutines can execute:

\`\`\`python
async def download_image(session, url):
    async with session.get(url) as response:
        content = await response.read()  # Pause here—event loop runs other tasks
        return content
\`\`\`

## \`asyncio.gather()\`: Concurrent Execution

\`asyncio.gather()\` runs multiple coroutines concurrently and waits for all to complete:

\`\`\`python
tasks = [download_image(session, url) for url in urls]
results = await asyncio.gather(*tasks)
\`\`\`

Key behaviors:
- All coroutines start nearly simultaneously
- Returns results in the same order as input
- If any raises an exception, \`gather()\` propagates it (use \`return_exceptions=True\` to handle failures gracefully)

## A Real-World Example

Here's a pattern from a production system that downloads and processes images from NASA's APOD API:

\`\`\`python
import asyncio
import aiohttp
import aiofiles
from tqdm import tqdm

async def download_image(session, url, filename, pbar):
    """Download with progress tracking"""
    try:
        async with session.get(url) as response:
            if response.status == 200:
                content = await response.read()
                async with aiofiles.open(filename, "wb") as f:
                    await f.write(content)
                pbar.update(1)
                return filename
    except Exception as e:
        pbar.update(1)
        return None

async def main():
    async with aiohttp.ClientSession() as session:
        # Fetch metadata from API
        async with session.get(BASE_URL, params={"api_key": API_KEY, "count": 10}) as response:
            data = await response.json()
        
        valid_items = [item for item in data if item.get("media_type") == "image"]
        
        # Download all images concurrently
        pbar = tqdm(total=len(valid_items), desc="Downloading", unit="img")
        tasks = []
        for i, item in enumerate(valid_items):
            url = item.get("hdurl") or item.get("url")
            tasks.append(download_image(session, url, f"space_{i}.jpg", pbar))
        
        results = await asyncio.gather(*tasks)
        pbar.close()
        
        return [f for f in results if f]  # Filter failures
\`\`\`

## Why Not Threads?

For I/O-bound work, threads technically work, but come with baggage:

1. **Memory overhead**: Each thread consumes stack space
2. **Context switching**: CPU switches between threads constantly
3. **GIL contention**: For CPU-bound work within threads, they compete

AsyncIO handles I/O-bound concurrency with a single thread, minimal overhead, and no GIL contention. Your code structure remains linear (async/await) while execution is concurrent.

## Bridging to Multiprocessing

AsyncIO excels at I/O, but what about CPU-bound work like image processing? You can't just \`await\` a blocking CPU task—it would freeze your event loop.

Python provides \`loop.run_in_executor()\` to bridge this gap. You can schedule blocking CPU work in a \`ProcessPoolExecutor\` while keeping your async event loop responsive. We'll explore this in Part 2.

## Summary

| Concept | Purpose |
|---------|---------|
| \`async def\` | Defines a coroutine that can be paused |
| \`await\` | Pauses coroutine, yields to event loop |
| \`asyncio.gather()\` | Runs multiple coroutines concurrently |
| \`aiohttp\` | Non-blocking HTTP client |
| \`aiofiles\` | Non-blocking file I/O |

AsyncIO is the right tool when you're dealing with network requests, file operations, or any I/O where you're waiting more than computing. It handles massive concurrency with minimal overhead.

## Example Code

The complete implementation of these concepts is available in my [async Python example repository](https://github.com/Suhird/async-code-example-python) on GitHub.
`;export{n as default};
