![WebAssembly component model](/images/blog/wasm-component-model.svg)

*The component model gives WebAssembly what containers got from HTTP: a typed contract between parts.*

## Containers solved packaging. They did not solve composition.

Docker made it possible to ship an application with its dependencies and run it anywhere. That was a genuine revolution. It did not, however, make it easy to compose untrusted code inside an application.

If you want a plugin system, a multi-tenant function runtime, or a data pipeline that runs customer-supplied transformations, containers are a heavy hammer. A container is hundreds of megabytes, takes hundreds of milliseconds to start, and shares a kernel. You can sandbox it, but the isolation boundary is a Linux namespace, not a language-level capability model.

WebAssembly (WASM) started as a browser technology. It is now a portable, sandboxed bytecode format with a growing server-side story. The **component model** is the part that makes it interesting for architecture: typed interfaces, composition, and capability-based security.

## WASM in one paragraph

WebAssembly is a stack-based virtual machine. You compile C, C++, Rust, Go, Zig, or many other languages to a `.wasm` module. The module runs in a sandbox with linear memory and no ambient access to the host. It cannot open a file, open a socket, or read the clock unless the host explicitly gives it a function to do so.

That last sentence is the security model. WASM has no syscalls. Everything is an imported function. The host decides what to expose.

## WASI: the portable system interface

A module that cannot do anything is not useful. WASI (WebAssembly System Interface) standardizes the host functions a module needs:

- `wasi:filesystem` for files and directories
- `wasi:sockets` for network access
- `wasi:clocks` for time
- `wasi:random` for randomness
- `wasi:cli` for arguments and environment
- `wasi:http` for HTTP requests and responses

WASI is capability-based. A component declares the interfaces it imports. The host grants only those capabilities, often scoped to a specific directory or socket. There is no "ambient authority" where a module can read `/etc/passwd` just because it is running.

This is closer to the object-capability model than to POSIX. It is also why WASM is attractive for plugins and multi-tenant runtimes.

## The component model: typed interfaces

A raw WASM module exports functions with numeric signatures. That is fine for a compiler, painful for composition. The component model adds:

- **WIT** (WebAssembly Interface Types): a language-neutral interface definition
- **typed imports and exports**: strings, records, lists, variants, results
- **composition**: link components through their interfaces
- **canonical ABI**: a standard way to pass complex types across the boundary

A WIT world describes what a component imports and exports:

```wit
// wit/world.wit
package example:greeter@1.0.0;

interface greeter {
    record greeting {
        message: string,
        language: string,
    }

    greet: func(name: string) -> greeting;
}

world greeter-world {
    export greeter;
}
```

A Rust implementation:

```rust
// src/lib.rs
use exports::example::greeter::greeter::{Greeting, Guest};

struct Component;

impl Guest for Component {
    fn greet(name: String) -> Greeting {
        Greeting {
            message: format!("Hello, {name}"),
            language: "en".to_string(),
        }
    }
}

wit_bindgen::generate!({
    world: "greeter-world",
    path: "wit",
});

export!(Component);
```

Build it as a component:

```bash
cargo build --target wasm32-wasip1 --release
wasm-tools component new \
  target/wasm32-wasip1/release/greeter.wasm \
  -o greeter.component.wasm

# Inspect the typed interface. A host (or wasmtime --invoke) calls greet().
wasm-tools component wit greeter.component.wasm
```

The result is a small, portable artifact with a typed contract. A host in Python, Go, or JavaScript can call `greet` without knowing it was written in Rust.

## Why composition matters

The component model lets you build an application from parts that do not share a language, runtime, or release cycle:

- a Rust data transformer
- a Python policy evaluator
- a JavaScript UI extension
- a Go HTTP adapter

Each part declares its imports and exports. The host links them. The boundaries are typed, so a change in one component's interface is a compile-time or link-time error, not a runtime surprise.

This is the plugin system that containers never gave us: small artifacts, fast startup, explicit capabilities, and a stable ABI.

## Where WASM components fit

Good fits:

- **Plugin systems** for SaaS products and developer tools
- **Edge functions** with millisecond cold starts and strong isolation
- **Multi-tenant data transformations** where customers upload code
- **Policy engines** (OPA-style rules) that must run in many hosts
- **Serverless** platforms that need density and fast scale-to-zero
- **Extensible proxies** and gateways

Poor fits (today):

- workloads that need threads, shared memory, or GPU access
- long-running stateful services with complex networking
- applications that depend on native libraries not yet ported
- teams that need mature debugging and profiling across every language

The ecosystem is improving quickly, but it is not a drop-in replacement for Linux containers for every workload.

## Security: capabilities, not vibes

WASM's sandbox is strong, but it is not magic. The security properties depend on the host:

- **Grant the minimum capabilities.** A plugin that formats text does not need network access.
- **Scope filesystem access** to a directory, not the whole disk.
- **Limit memory and CPU.** A malicious module can still allocate until the host kills it.
- **Validate inputs at the boundary.** Typed interfaces prevent some bugs, not logical attacks.
- **Isolate tenants.** One component per tenant, or one instance per request, depending on the threat model.
- **Audit imports.** A component's import list is its permission set; make it visible.

The capability model is a significant improvement over "run this container and hope the namespace holds," but it moves the responsibility to the host configuration. A permissive host can undo the sandbox.

## The developer experience

The tooling is young but usable:

- `wasm-tools` for building, inspecting, and composing components
- `wasmtime` for running components on the server
- `jco` for JavaScript hosts
- `wit-bindgen` for generating language bindings
- `wasmCloud` and `Spin` for higher-level application runtimes

The debugging story is improving: `wasmtime` supports DWARF debugging, and `wasm-tools` can print the component structure. It is not yet as smooth as `docker logs` and `kubectl exec`, but it is no longer a research project.

## The takeaway

WebAssembly components are not "containers but smaller." They are a different composition model: typed interfaces, explicit capabilities, and a sandbox that does not depend on the host kernel's namespace implementation.

If you are building a plugin system, a multi-tenant runtime, or an edge platform, the component model is worth a serious look. If you are running a standard CRUD service, containers are still the pragmatic choice.

The promise is not "write once, run everywhere." It is "compose once, link anywhere, with capabilities you can audit." That is a better foundation for the next decade of extensible software.
