# Accelerating Python with Rust & PyO3

Learn how to speed up your Python code by rewriting critical bottlenecks in Rust using PyO3.


## The Problem: CPU Bound Tasks

Python is great, but it struggles with heavy computation loops. Let's try to estimate **Pi** using a Monte Carlo simulation. We randomly throw 10 million darts at a square:

```python
# slow.py
import random
import time

def estimate_pi(n):
    inside = 0
    for _ in range(n):
        x = random.random()
        y = random.random()
        if x*x + y*y <= 1.0:
            inside += 1
    return (inside / n) * 4
```

Running `estimate_pi(10_000_000)` takes about **2.5 seconds**. Too slow.

## The Solution: Rust + PyO3

We can rewrite this loop in Rust.

```rust
// lib.rs
use pyo3.prelude::*;
use rand::prelude::*;

#[pyfunction]
fn estimate_pi_rust(n: u64) -> f64 {
    let mut rng = rand::thread_rng();
    let mut inside = 0;

    for _ in 0..n {
        let x: f64 = rng.gen();
        let y: f64 = rng.gen();
        if x*x + y*y <= 1.0 {
            inside += 1;
        }
    }
    
    (inside as f64 / n as f64) * 4.0
}

#[pymodule]
fn my_module(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(estimate_pi_rust, m)?)?;
    Ok(())
}
```

This is almost identical logic, but compiles to native machine code.


## Conclusion

I hope this gives you a better understanding of Rust. If you enjoyed this post, check out the other articles in this series!
