# Accelerating Python with Rust & PyO3 (Part 1: Getting Started)

I had a Python script that processed CSV files. Not anything fancy — just reading rows, transforming data, writing output. But with large files (think millions of rows), it took *minutes*. Pure Python, doing its best, but those nested loops and string operations were killing me.

So I did what any reasonable developer would do: I rewrote the bottleneck in Rust.

The result? **40x faster**. And honestly, the setup was easier than I expected.

Let me show you how.

## Why Rust for Python?

Python is slow because it's interpreted. Every operation — even simple arithmetic — goes through the Python interpreter at runtime. For I/O-bound tasks (reading files, network calls), this doesn't matter much. But for CPU-bound work (number crunching, parsing, data transformation), it's a killer.

Rust compiles to native machine code. No interpreter, no overhead. You get C-level performance with memory safety guarantees.

`PyO3` is the bridge — it lets you write Rust code that Python can import and call like any other module.

## Project Setup

We'll use `maturin` for building, which handles all the PyO3 boilerplate. Trust me, you don't want to configure this manually.

```bash
# Create project with maturin
curl -L https://github.com/PyO3/maturin/releases/download/v1.5.0/maturin-installer.sh | sh

# Or install via pip
pip install maturin

# Create new project
maturin new --name=fastlib rust_ext
cd rust_ext
```

This creates:

```
rust_ext/
├── Cargo.toml
├── src/
│   └── lib.rs
├── python/
│   └── rust_ext/
│       └── __init__.py
├── .github/
├── tests/
├── README.md
└── pyproject.toml
```

## Your First Rust Function

Let's start simple. We'll implement a function that counts prime numbers — CPU-bound, easy to benchmark.

Open `src/lib.rs`:

```rust
use pyo3::prelude::*;

/// Count prime numbers up to n using the Sieve of Eratosthenes
#[pyfunction]
fn count_primes(n: u64) -> u64 {
    if n < 2 {
        return 0;
    }
    
    let mut is_prime = vec![true; (n as usize) + 1];
    is_prime[0] = false;
    is_prime[1] = false;
    
    let mut count = 0;
    for i in 2..=(n as usize) {
        if is_prime[i] {
            count += 1;
            // Mark all multiples of i as not prime
            let mut j = i * i;
            while j <= n as usize {
                is_prime[j] = false;
                j += i;
            }
        }
    }
    
    count
}

#[pymodule]
fn fastlib(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(count_primes, m)?)?;
    Ok(())
}
```

A few things to notice:

- `#[pyfunction]` — This macro makes the function callable from Python
- `#[pymodule]` — This macro marks the module that Python will import
- The function signature is pure Rust — `u64` instead of Python's arbitrary integers, but that's fine

## Building and Testing

```bash
# Develop in debug mode (fast to compile, slower runtime)
maturin develop

# Build for release (slower to compile, fastest runtime)
maturin build --release
```

Now in Python:

```python
import fastlib
import time

# Test it works
print(f"Primes up to 100: {fastlib.count_primes(100)}")  # 25

# Benchmark
start = time.perf_counter()
result = fastlib.count_primes(10_000_000)
elapsed = time.perf_counter() - start

print(f"Found {result} primes in {elapsed:.3f}s")
```

On my machine: **0.08 seconds** to count primes up to 10 million.

The equivalent Python:

```python
def count_primes_py(n):
    if n < 2:
        return 0
    is_prime = [True] * (n + 1)
    is_prime[0] = False
    is_prime[1] = False
    count = 0
    for i in range(2, n + 1):
        if is_prime[i]:
            count += 1
            j = i * i
            while j <= n:
                is_prime[j] = False
                j += i
    return count
```

Takes **8.5 seconds**. That's a **100x speedup**.

## Adding More Functions

You can export multiple functions:

```rust
use pyo3::prelude::*;

#[pyfunction]
fn count_primes(n: u64) -> u64 {
    // ... same as before
}

#[pyfunction]
fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
    let mut i = 3;
    while i * i <= n {
        if n % i == 0 {
            return false;
        }
        i += 2;
    }
    true
}

#[pymodule]
fn fastlib(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(count_primes, m)?)?;
    m.add_function(wrap_pyfunction!(is_prime, m)?)?;
    Ok(())
}
```

## Handling Errors

When things go wrong, you want Python exceptions, not panics. PyO3 makes this clean:

```rust
use pyo3::exceptions::PyValueError;

#[pyfunction]
fn safe_divide(a: f64, b: f64) -> PyResult<f64> {
    if b == 0.0 {
        return Err(PyValueError::new_err("Cannot divide by zero"));
    }
    Ok(a / b)
}
```

In Python:

```python
try:
    fastlib.safe_divide(1.0, 0.0)
except ValueError as e:
    print(f"Error: {e}")  # "Cannot divide by zero"
```

## Building for Distribution

When you're ready to ship:

```bash
# Build wheel for PyPI
maturin build --release --out dist

# Or build for a specific Python version
maturin build --release -i python3.11 --out dist
```

This creates a `.whl` file that users can `pip install`. It includes the compiled Rust code as a native extension — no Rust installation required on the target machine.

## What's Next?

In Part 2, we'll tackle a more practical problem: **processing large text files**. I'll show you how to:

- Pass strings between Python and Rust efficiently
- Use Rust's `utf8` crate for fast string parsing
- Benchmark properly (because microbenchmarks lie)
- Structure your code for maintainability

Spoiler: I processed 2GB of log files in 3 seconds instead of 4 minutes.

[Continue to Part 2 →](/blog/accelerating-python-rust-pyo3-part-2)
