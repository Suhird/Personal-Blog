# True Parallelism with Multiprocessing

While AsyncIO excels at I/O-bound concurrency, CPU-bound tasks need a different approach. Image processing, scientific computations, and data parsing all require true parallel execution—something the GIL actively prevents with threads.

## The Problem: CPU-Bound Work and the GIL

Python's Global Interpreter Lock means only one thread can execute bytecode at a time. For CPU-bound work like image processing, threading doesn't help:

```python
# This won't give you parallelism for CPU work
import threading
import cv2

def process_image(filename):
    img = cv2.imread(filename)
    # Heavy computation...
    return result

# All these threads compete for the GIL
threads = [threading.Thread(target=process_image, args=(f,)) for f in files]
```

Even with multiple threads, only one executes Python at any moment. The GIL serializes your work.

## The Solution: Multiprocessing

Multiprocessing spawns separate OS processes, each with its own Python interpreter and GIL. Now all your CPU cores work simultaneously:

```python
from concurrent.futures import ProcessPoolExecutor
import cv2

def detect_stars(filename):
    """CPU-intensive star detection using OpenCV"""
    img = cv2.imread(filename)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    params = cv2.SimpleBlobDetector_Params()
    params.filterByColor = True
    params.blobColor = 255
    params.filterByArea = True
    params.minArea = 10
    
    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(gray)
    
    return len(keypoints)

# ProcessPoolExecutor uses all available CPU cores
with ProcessPoolExecutor() as pool:
    results = pool.map(detect_stars, filenames)
```

## ProcessPoolExecutor vs ThreadPoolExecutor

| Feature | ProcessPoolExecutor | ThreadPoolExecutor |
|---------|--------------------|--------------------|
| Parallelism | True (multi-core) | Limited (GIL) |
| Memory | Separate per process | Shared |
| Overhead | Higher (process creation) | Lower |
| Best for | CPU-bound tasks | I/O-bound tasks |

For CPU-intensive OpenCV work, `ProcessPoolExecutor` is the clear choice.

## Bridging AsyncIO and Multiprocessing

Here's the challenge: you have an async event loop handling downloads, but now need to process images with CPU-intensive OpenCV. Calling blocking multiprocessing code directly would freeze your event loop.

The solution: `loop.run_in_executor()`.

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm

def detect_stars_and_process(filename):
    """Synchronous CPU-bound function"""
    img = cv2.imread(filename)
    # ... processing ...
    return f"Found {len(keypoints)} stars in {filename}"

async def main():
    loop = asyncio.get_running_loop()
    
    with ProcessPoolExecutor() as pool:
        pbar = tqdm(total=len(files), desc="Analyzing", unit="img")
        results = []
        
        for fname in files:
            # Schedule blocking function in process pool
            fut = loop.run_in_executor(pool, detect_stars_and_process, fname)
            # Add callback to update progress bar when done
            fut.add_done_callback(lambda _: pbar.update(1))
            results.append(fut)
        
        # Wait for all processing to complete
        summaries = await asyncio.gather(*results)
```

## How `run_in_executor()` Works

`run_in_executor()` schedules a synchronous function to run in an executor (thread pool or process pool) without blocking the event loop:

```python
fut = loop.run_in_executor(pool, detect_stars_and_process, filename)
```

It returns a `Future`—a promise of a result. The event loop continues running other coroutines while the process pool handles CPU work. When you `await` the future, you get the result.

## Progress Tracking with `add_done_callback()`

Since `run_in_executor()` returns futures, you can attach callbacks that fire when a task completes:

```python
fut.add_done_callback(lambda _: pbar.update(1))
```

This is non-blocking. When a processing task finishes, the callback updates your progress bar. No need to manually check futures or introduce additional await points.

## Complete Pattern: Async Downloads + Parallel Processing

This pattern combines AsyncIO for network I/O with multiprocessing for CPU work:

```python
import asyncio
import aiohttp
import aiofiles
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm
import cv2
import config

async def download_image(session, url, filename, pbar):
    async with session.get(url) as response:
        if response.status == 200:
            content = await response.read()
            async with aiofiles.open(filename, "wb") as f:
                await f.write(content)
            pbar.update(1)
            return filename

def process_image(filename):
    """CPU-bound: detect stars with OpenCV"""
    img = cv2.imread(filename)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    params = cv2.SimpleBlobDetector_Params()
    params.filterByColor = True
    params.blobColor = 255
    params.filterByArea = True
    params.minArea = 10
    
    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(gray)
    
    output_path = filename.replace("space_", "detected_")
    img_with_keys = cv2.drawKeypoints(
        img, keypoints, None, (0, 0, 255),
        cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )
    cv2.imwrite(output_path, img_with_keys)
    
    return f"Found {len(keypoints)} stars"

async def main():
    # Phase 1: Async downloads (I/O-bound)
    async with aiohttp.ClientSession() as session:
        async with session.get(config.BASE_URL, params={"api_key": config.NASA_API_KEY, "count": 10}) as response:
            data = await response.json()
        
        valid_items = [item for item in data if item.get("media_type") == "image"]
        
        pbar = tqdm(total=len(valid_items), desc="Downloading", unit="img")
        tasks = [
            download_image(session, item.get("hdurl") or item.get("url"), f"space_{i}.jpg", pbar)
            for i, item in enumerate(valid_items)
        ]
        downloaded_files = await asyncio.gather(*tasks)
        pbar.close()
    
    downloaded = [f for f in downloaded_files if f]
    
    # Phase 2: Multiprocessing (CPU-bound)
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        pbar = tqdm(total=len(downloaded), desc="Analyzing", unit="img")
        results = []
        
        for fname in downloaded:
            fut = loop.run_in_executor(pool, process_image, fname)
            fut.add_done_callback(lambda _: pbar.update(1))
            results.append(fut)
        
        summaries = await asyncio.gather(*results)
    
    for summary in summaries:
        print(f"  {summary}")

if __name__ == "__main__":
    asyncio.run(main())
```

## Performance Comparison

| Approach | 10 Images Download | 10 Images Process | Total |
|----------|-------------------|-------------------|-------|
| Sequential | 20s | 10s | 30s |
| AsyncIO only | 2s | 10s | 12s |
| AsyncIO + Multiprocessing | 2s | 2s | **4s** |

AsyncIO handles concurrent downloads efficiently while multiprocessing processes images across all CPU cores simultaneously.

## When to Use What

| Task | Bottleneck | Solution |
|------|------------|----------|
| HTTP requests, API calls | Network I/O | AsyncIO |
| File I/O | Disk I/O | AsyncIO |
| Database queries | Network/Disk | AsyncIO |
| Image processing, OpenCV | CPU | Multiprocessing |
| Video encoding | CPU | Multiprocessing |
| Scientific computations | CPU | Multiprocessing |
| Math-heavy loops | CPU | Multiprocessing |

## Summary

`ProcessPoolExecutor` bypasses the GIL entirely, giving you true multi-core parallelism for CPU-bound work. Combined with AsyncIO via `run_in_executor()`, you get the best of both worlds: efficient I/O concurrency and CPU parallelism in the same application.

The key APIs:

- `ProcessPoolExecutor()` — Create a pool of worker processes
- `pool.map(func, items)` — Distribute work across cores
- `loop.run_in_executor(pool, func, args)` — Schedule blocking work from async code
- `fut.add_done_callback(fn)` — React to task completion without blocking

## Example Code

The complete implementation combining AsyncIO and multiprocessing is available in my [async Python example repository](https://github.com/Suhird/async-code-example-python) on GitHub.
