const n=`# WebAssembly with Rust: A Primer

Compiling Rust to WebAssembly (Wasm) allows you to run high-performance code directly in the browser. It opens up new possibilities for web applications by enabling near-native speed execution for compute-heavy tasks.

## Why WebAssembly (WASM)?

JavaScript is incredibly fast today thanks to JIT compilers like V8, but it still struggles with certain workloads—like video editing, fully fledged game engines, or complex cryptographic operations. 

WebAssembly is a binary instruction format designed as a portable compilation target. What does this mean for you?
1. **Performance**: It executes at near-native speed.
2. **Safety**: It runs in a memory-safe, sandboxed environment inside the browser.
3. **Language Flexibility**: You aren't forced to write C++ or Rust—you can compile your existing codebases.

Rust is arguably the best ecosystem for WebAssembly today because it explicitly lacks a bulky runtime or garbage collector, resulting in tiny, fast Wasm modules.

## Hello WASM

The absolute minimum example requires the \`wasm-bindgen\` crate, which acts as the bridge between Rust and JavaScript.

\`\`\`rust
use wasm_bindgen::prelude::*;

// Import the \`window.alert\` function from the Web.
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

// Export a \`greet\` function to JavaScript.
#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
\`\`\`

You can compile this code into a Wasm module using \`wasm-pack\`:

\`\`\`bash
cargo install wasm-pack
wasm-pack build --target web
\`\`\`

## Project Example: A Blazing Fast Markdown Parser

Let’s build something a bit more practical. Suppose your single-page app needs to render thousands of lines of Markdown in real-time as the user types. Doing this in JavaScript can block the main thread and cause UI stuttering.

Instead, we will write a Markdown to HTML parser in Rust using the popular \`pulldown-cmark\` crate, compile it to Wasm, and call it directly from JavaScript.

### 1. Setup the Rust Project

First, initialize a new library project:

\`\`\`bash
cargo new --lib wasm-markdown-parser
cd wasm-markdown-parser
\`\`\`

Update your \`Cargo.toml\` to configure the library target and add the necessary dependencies:

\`\`\`toml
[package]
name = "wasm-markdown-parser"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
pulldown-cmark = "0.9"
\`\`\`

### 2. Write the Rust Code

Open \`src/lib.rs\` and write the parsing logic. We will export a single function \`parse_markdown\` that takes a string of Markdown and returns the HTML string.

\`\`\`rust
use wasm_bindgen::prelude::*;
use pulldown_cmark::{Parser, html};

#[wasm_bindgen]
pub fn parse_markdown(markdown_input: &str) -> String {
    // Initialize the markdown parser
    let parser = Parser::new(markdown_input);
    
    // Write the output to a string variable
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    
    html_output
}
\`\`\`

### 3. Build for the Web

Compile the project utilizing \`wasm-pack\`:

\`\`\`bash
wasm-pack build --target web
\`\`\`

This creates a \`pkg\` directory containing the \`.wasm\` binary along with the JavaScript bindings we need to load it.

### 4. Use it in the Browser

Finally, load the generated module in your frontend (e.g., an \`index.html\` file):

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rust WebAssembly Markdown Parser</title>
</head>
<body>
    <textarea id="markdown-input" rows="10" cols="50"># Hello WASM!
This is **blazing** fast.
    </textarea>
    <div id="html-output"></div>

    <script type="module">
        // Import the automatically generated bindings
        import init, { parse_markdown } from './pkg/wasm_markdown_parser.js';

        async function run() {
            // Initialize the WebAssembly module
            await init();

            const inputElement = document.getElementById('markdown-input');
            const outputElement = document.getElementById('html-output');

            const render = () => {
                const markdown = inputElement.value;
                // Call the Rust function natively in JS
                outputElement.innerHTML = parse_markdown(markdown);
            };

            inputElement.addEventListener('input', render);
            render(); // Initial render
        }

        run();
    <\/script>
</body>
</html>
\`\`\`

## Conclusion

By leveraging WebAssembly and Rust, you can bring high-performance capabilities to the browser with minimal overhead. The barrier to entry has dramatically lowered thanks to tooling like \`wasm-bindgen\` and \`wasm-pack\`. 

Whether you're parsing huge documents, applying heavy image filters, or porting complex algorithms, WebAssembly opens up a new frontier for frontend development.
`;export{n as default};
