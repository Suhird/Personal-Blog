# Real-world Benchmarks: Python vs Rust

We compare pure Python, NumPy, and Rust implementations of heavy computational algorithms.


## The Showdown

We ran the **Monte Carlo Pi Estimation** for **100,000,000 iterations**.

### The Contenders

1.  **Pure Python**: The loop we wrote in Part 1.
2.  **NumPy**: Vectorized operation `np.sum(x**2 + y**2 <= 1)`.
3.  **Rust**: The PyO3 extension.

### Results

| Implementation | Time (100M) | Memory | Speedup |
|----------------|-------------|--------|---------|
| **Pure Python** | 24.5s      | 20MB   | 1x      |
| **NumPy**       | 1.2s       | 1.6GB* | ~20x    |
| **Rust**        | **0.35s**  | **~0B**| **~70x**|

*NumPy needs to allocate massive arrays for the vectors `x` and `y` before calculating.*

### Analysis

Rust is **70x faster** than pure Python and **3x faster** than NumPy.

Crucially, **Rust used almost no memory**. NumPy crashed on my laptop when I tried 1 billion iterations because it tried to allocate 16GB of RAM. The Rust version ran happily in constant space.


## Conclusion

I hope this gives you a better understanding of Rust. If you enjoyed this post, check out the other articles in this series!
