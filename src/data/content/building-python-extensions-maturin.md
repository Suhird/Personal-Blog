# Building Python Extensions with Maturin

A deep dive into packaging and publishing mixed Python/Rust projects using Maturin.


## Setting up the Project

To build our Monte Carlo extension, we need `maturin`. It handles the complex C FFI bridging.

```bash
maturin new monte-carlo --mixed
```

### Dependencies (Cargo.toml)

We need the `rand` crate for our simulation.

```toml
[package]
name = "monte-carlo"
version = "0.1.0"
edition = "2021"

[lib]
name = "monte_carlo"
crate-type = ["cdylib"] # Important for Python modules!

[dependencies]
pyo3 = { version = "0.20", features = ["extension-module"] }
rand = "0.8"
```

### Building

To install it into your current virtual environment:

```bash
maturin develop --release
```

Now in Python, you can simply do:

```python
import monte_carlo
val = monte_carlo.estimate_pi_rust(1000)
```


## Conclusion

I hope this gives you a better understanding of Rust. If you enjoyed this post, check out the other articles in this series!
