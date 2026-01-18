const e=`# True Parallelism with Multiprocessing

Bypassing the GIL: How to use the multiprocessing module for CPU-bound tasks in Python.


## The Project: Batch Image Processor (Part 2)

In [Part 1](/blog/mastering-python-asyncio), we downloaded 1,000 images using AsyncIO. Now we have a folder full of raw files.

**Goal**: Resize all 1,000 images to 200x200 thumbnails.

## The Problem: The GIL

If we try to use \`AsyncIO\` or \`Threading\` for image processing (a CPU-heavy task), we hit the **Global Interpreter Lock (GIL)**. Only one thread can execute Python bytecode at a time. Using threads here might actually be *slower* due to context switching overhead.

## The Solution: Multiprocessing

The \`multiprocessing\` module spins up separate operating system processes. Each process has:
1. Its own Python interpreter.
2. Its own memory space.
3. **Its own GIL.**

This allows us to use all cores (e.g., 8 or 16) of the CPU simultaneously.

### Implementation

\`\`\`python
from multiprocessing import Pool
from PIL import Image
import os

def resize_image(filename):
    # This is a heavy CPU operation
    with Image.open(filename) as img:
        img = img.resize((200, 200))
        img.save(f"thumbs/{filename}")
    return f"Processed {filename}"

if __name__ == "__main__":
    files = os.listdir("./raw_images")
    
    # Create a pool of workers equal to CPU core count
    with Pool() as p:
        # map automatically chunks the data and sends it to workers
        results = p.map(resize_image, files)
        
    print("Done!")
\`\`\`

## When to use what?

| Task Type | Bottleneck | Solution |
|-----------|------------|----------|
| **Downloading Files** | Network Latency | **AsyncIO** (Part 1) |
| **Resizing Images** | CPU Computing Power | **Multiprocessing** (Part 2) |
| **DB Queries** | Network/Disk Latency | **AsyncIO** |
| **Video Encoding** | CPU | **Multiprocessing** |


## Conclusion

I hope this gives you a better understanding of Python. If you enjoyed this post, check out the other articles in this series!
`;export{e as default};
