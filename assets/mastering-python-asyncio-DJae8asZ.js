const n=`# Mastering Python AsyncIO

Understand the event loop, coroutines, and tasks to write highly concurrent network-bound applications.


![Visualizing Python Concurrency vs GIL](/python_gil_concurrency.png)

## What is Concurrency?

Before we dive into code, let's clarify two often confused terms:
1.  **Concurrency**: Dealing with multiple things at once (e.g., waiting for network, then disk, then user input). Structure.
2.  **Parallelism**: Doing multiple things at the exact same time (e.g., calculating two math problems on two different CPU cores). Execution.

### The Elephant in the Room: The GIL

Python (CPython) has a **Global Interpreter Lock**. It's a mutex that prevents multiple native threads from executing Python bytecodes at once.

| Mechanism | CPU Usage | GIL Status | Best For |
|-----------|-----------|------------|----------|
| **Threading** | 1 Core (switches) | Held (fighting) | I/O (Legacy) |
| **Multiprocessing** | N Cores | Bypassed (Separate Memory) | CPU Heavy Tasks |
| **AsyncIO** | 1 Core | Held (Cooperative) | High Concurrency I/O |

**AsyncIO** works by having a single thread (Postman) that delivers a letter (Request), and instead of waiting at the door, goes to deliver another letter. When the door opens (Response), he comes back.

## The Project: Batch Image Processor (Part 1)

In this two-part series, we are building a high-performance **Batch Image Processor**. 
- **Part 1 (This Post)**: Efficiently downloading thousands of images using \`AsyncIO\`.
- **Part 2**: CPU-intensive resizing using \`Multiprocessing\`.

## The Problem: Blocking I/O

Imagine we need to download 1,000 images. In synchronous Python with \`requests\`:

\`\`\`python
import requests
import time

def download_sync(urls):
    for url in urls:
        # The CPU does NOTHING here while waiting for the network
        requests.get(url) 
\`\`\`

This is incredibly potential wasteful. The CPU is idle 99% of the time waiting for servers to reply.

## The Solution: AsyncIO & Aiohttp

AsyncIO allows us to initiate a request, and yield control back to the **Event Loop** immediately. The loop can then start another request.

### Implementation

We use \`aiohttp\` for non-blocking HTTP requests.

\`\`\`python
import asyncio
import aiohttp

async def download_image(session, url):
    async with session.get(url) as response:
        content = await response.read()
        print(f"Downloaded {url}")
        return content

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [download_image(session, url) for url in urls]
        # Run all downloads CONCURRENTLY
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    urls = [f"https://example.com/img_{i}.jpg" for i in range(100)]
    # This runs orders of magnitude faster than the sync version
    asyncio.run(main(urls))
\`\`\`

By using \`asyncio.gather\`, we fire off all 100 requests almost instantly. The network pipe is filled, and our throughput is maximized.


## Conclusion

I hope this gives you a better understanding of Python. If you enjoyed this post, check out the other articles in this series!
`;export{n as default};
