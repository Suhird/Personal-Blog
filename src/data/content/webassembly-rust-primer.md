# WebAssembly with Rust: A Primer

Compiling Rust to WebAssembly to run high-performance code in the browser.


## Why WASM?

It allows you to run C++/Rust code in the browser at near-native speed. Perfect for video editing, games, or complex math on the client.

### Hello WASM

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
```

Compile with `wasm-pack build --target web`.


## Conclusion

I hope this gives you a better understanding of Rust. If you enjoyed this post, check out the other articles in this series!
