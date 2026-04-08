const t=`# Rust by doing: Build your own X (Part 1: CLI Tools)

I've been meaning to get serious about Rust for a while now. I kept starting the book, getting distracted, and forgetting everything by the time I came back. Classic tutorial purgatory.

So I switched strategies. Instead of reading about structs for the fifth time, I decided to just *build things*. The "Build your own X" approach has worked for me before — why not apply it to learning Rust properly?

This is the start of a series where I tackle classic tools, understand what they do, and try to build simplified versions myself. No hand-holding, just me, the docs, and a lot of \`cargo build\` failures.

Let's start with something fundamental: **CLI tools**. Three classics — \`grep\`, \`wc\`, and a todo list manager. Nothing fancy, but each one teaches you something different about Rust.

---

## Tool 1: grep-clone — Searching Text Like a Pro

The Unix \`grep\` command is one of those tools I use hundreds of times a day without thinking. But building a simplified version? That's when you realize how much it's actually doing.

The goal was simple: read a file, search for lines containing a pattern, print matching lines. Easy, right?

### The Struggle

My first instinct was to write a loop. Iterate through lines, check if the pattern exists, print. It would work, but I could tell Rust had better ways.

\`\`\`rust:grep-clone/src/lib.rs
use anyhow::Result;

/// Read the entire contents of a file at \`path\` and return it as a String.
///
/// TODO: Use \`std::fs::read_to_string(path)\` to read the file.
///   The \`?\` operator will propagate any IO error (file not found, permission denied).
///   See: https://doc.rust-lang.org/std/fs/fn.read_to_string.html
///
/// Example:
///   read_file_contents("poem.txt") => Ok("roses are red\\nviolets are blue\\n")
pub fn read_file_contents(path: &str) -> Result<String> {
    todo!()
}

/// Search \`content\` for lines containing \`pattern\` (literal match, case-sensitive).
/// Returns a Vec of matching lines as &str slices into \`content\`.
///
/// TODO: Step 1 — call \`content.lines()\` to get an iterator of lines.
///   See: https://doc.rust-lang.org/std/primitive.str.html#method.lines
///
/// TODO: Step 2 — chain \`.filter(|line| line.contains(pattern))\` to keep only matches.
///   See: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter
///   See: https://doc.rust-lang.org/std/primitive.str.html#method.contains
///
/// TODO: Step 3 — chain \`.collect()\` to gather results into Vec<&str>.
///   Hint: you may need to annotate the return type or use turbofish: \`.collect::<Vec<_>>()\`
///   See: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect
pub fn search<'a>(pattern: &str, content: &'a str) -> Vec<&'a str> {
    todo!()
}
\`\`\`

### The Solution

The \`todo!()\` macro is great for planning — it forces you to implement things one step at a time. Here's how I eventually solved it:

\`\`\`rust:grep-clone/src/lib.rs
use anyhow::Result;

pub fn read_file_contents(path: &str) -> Result<String> {
    std::fs::read_to_string(path)
}

pub fn search<'a>(pattern: &str, content: &'a str) -> Vec<&'a str> {
    content
        .lines()
        .filter(|line| line.contains(pattern))
        .collect()
}
\`\`\`

**What I learned:**

- \`std::fs::read_to_string\` is blissfully simple — one line to read an entire file, and the \`?\` operator handles errors elegantly.
- Rust iterators are *chained*. \`.lines()\` gives you an iterator, \`.filter()\` transforms it, \`.collect()\` gathers the results. It's like functional programming but readable.
- The turbofish syntax (\`::<Vec<_>>()\`) confused me at first, but it's just Rust being explicit about types when the compiler can't infer them.

---

## Tool 2: wc-clone — Counting Things

The \`wc\` (word count) command counts lines, words, and characters in a file. Sounds trivial, but it was a great exercise in working with Rust's iterator methods.

\`\`\`rust:wc-clone/src/lib.rs
use anyhow::Result;

/// Holds line, word, and character counts for a piece of text.
#[derive(Debug, PartialEq)]
pub struct WordCount {
    pub lines: usize,
    pub words: usize,
    pub chars: usize,
}

/// Count lines, words, and characters in \`content\`.
///
/// TODO: Count lines
///   Hint: \`content.lines().count()\`
///   See: https://doc.rust-lang.org/std/primitive.str.html#method.lines
///
/// TODO: Count words
///   Hint: for each line, call \`.split_whitespace().count()\` and sum them.
///   See: https://doc.rust-lang.org/std/primitive.str.html#method.split_whitespace
///   Hint: use \`.map(|line| line.split_whitespace().count()).sum::<usize>()\` on the lines iterator.
///
/// TODO: Count characters
///   Hint: \`content.chars().count()\` — this counts Unicode scalar values, not bytes.
///   See: https://doc.rust-lang.org/std/primitive.str.html#method.chars
pub fn count(content: &str) -> WordCount {
    todo!()
}

/// Read a file and return its contents as a String.
///
/// TODO: Use \`std::fs::read_to_string(path)?\`
pub fn read_file(path: &str) -> Result<String> {
    todo!()
}
\`\`\`

### The Solution

\`\`\`rust:wc-clone/src/lib.rs
use anyhow::Result;

#[derive(Debug, PartialEq)]
pub struct WordCount {
    pub lines: usize,
    pub words: usize,
    pub chars: usize,
}

pub fn count(content: &str) -> WordCount {
    let lines = content.lines().count();
    let words = content.lines()
        .map(|line| line.split_whitespace().count())
        .sum::<usize>();
    let chars = content.chars().count();

    WordCount { lines, words, chars }
}

pub fn read_file(path: &str) -> Result<String> {
    std::fs::read_to_string(path)
}
\`\`\`

**What I learned:**

- \`.lines()\` doesn't include the trailing newline — that's actually what you want most of the time.
- \`.split_whitespace()\` handles multiple spaces beautifully, no need to regex.
- \`.chars().count()\` counts Unicode characters, not bytes. Try it with emoji and you'll see why it matters.
- Combining \`.map()\` and \`.sum()\` is a clean way to aggregate.

---

## Tool 3: todo-cli — Persistence with serde

Now things got interesting. A todo CLI that actually persists data to a JSON file. This introduced two new concepts: \`serde\` for serialization and the \`?\` operator for error handling.

\`\`\`rust:todo-cli/src/lib.rs
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

const TODOS_FILE: &str = "todos.json";

/// A single to-do item.
/// The derive macros are pre-written for you — serde handles JSON conversion automatically.
#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
    pub id: usize,
    pub text: String,
    pub done: bool,
}

/// Load todos from \`todos.json\`. Return an empty Vec if the file doesn't exist.
///
/// TODO: Check if the file exists with \`Path::new(TODOS_FILE).exists()\`.
///   If it doesn't exist, return \`Ok(vec![])\`.
///   If it does, read it with \`std::fs::read_to_string(TODOS_FILE)?\`
///   then deserialize with \`serde_json::from_str(&contents)?\`.
///   See: https://doc.rust-lang.org/std/path/struct.Path.html#method.exists
///   See: https://docs.rs/serde_json/latest/serde_json/fn.from_str.html
pub fn load_todos() -> Result<Vec<Todo>> {
    todo!()
}

/// Save todos to \`todos.json\`, overwriting any existing file.
///
/// TODO: Serialize with \`serde_json::to_string_pretty(&todos)?\`
///   then write with \`std::fs::write(TODOS_FILE, json)?\`.
///   See: https://docs.rs/serde_json/latest/serde_json/fn.to_string_pretty.html
pub fn save_todos(todos: &[Todo]) -> Result<()> {
    todo!()
}

/// Add a new todo with the given text. Assigns the next available id.
///
/// TODO: Load todos, find the max id (or 0 if empty), create a new Todo
///   with id = max + 1, done = false, push it, save, print "Added: {text}".
pub fn add_todo(text: &str) -> Result<()> {
    todo!()
}

/// Print all todos.
///
/// TODO: Load todos. If empty, print "No todos yet!".
///   Otherwise print each: \`[x] 1. Buy milk\` for done, \`[ ] 2. Learn Rust\` for not done.
///   Hint: use \`if todo.done { "x" } else { " " }\` for the checkbox.
pub fn list_todos() -> Result<()> {
    todo!()
}

/// Mark the todo with \`id\` as done.
///
/// TODO: Load todos, find the one with matching id (return an error if not found),
///   set done = true, save, print "Done: {text}".
///   Hint: use \`.iter_mut().find(|t| t.id == id)\` to get a mutable reference.
pub fn mark_done(id: usize) -> Result<()> {
    todo!()
}

/// Delete the todo with \`id\`.
///
/// TODO: Load todos, remove the entry with matching id (error if not found),
///   save, print "Deleted item {id}".
///   Hint: use \`.retain(|t| t.id != id)\` — but check first that the id exists.
///   See: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.retain
pub fn delete_todo(id: usize) -> Result<()> {
    todo!()
}
\`\`\`

### The Solution

\`\`\`rust:todo-cli/src/lib.rs
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

const TODOS_FILE: &str = "todos.json";

#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
    pub id: usize,
    pub text: String,
    pub done: bool,
}

pub fn load_todos() -> Result<Vec<Todo>> {
    if !Path::new(TODOS_FILE).exists() {
        return Ok(vec![]);
    }
    let contents = std::fs::read_to_string(TODOS_FILE)?;
    let todos: Vec<Todo> = serde_json::from_str(&contents)?;
    Ok(todos)
}

pub fn save_todos(todos: &[Todo]) -> Result<()> {
    let json = serde_json::to_string_pretty(todos)?;
    std::fs::write(TODOS_FILE, json)?;
    Ok(())
}

pub fn add_todo(text: &str) -> Result<()> {
    let mut todos = load_todos()?;
    let max_id = todos.iter().map(|t| t.id).max().unwrap_or(0);
    let todo = Todo {
        id: max_id + 1,
        text: text.to_string(),
        done: false,
    };
    todos.push(todo);
    save_todos(&todos)?;
    println!("Added: {text}");
    Ok(())
}

pub fn list_todos() -> Result<()> {
    let todos = load_todos()?;
    if todos.is_empty() {
        println!("No todos yet!");
        return Ok(());
    }
    for todo in &todos {
        let checkbox = if todo.done { "x" } else { " " };
        println!("[{}] {}. {}", checkbox, todo.id, todo.text);
    }
    Ok(())
}

pub fn mark_done(id: usize) -> Result<()> {
    let mut todos = load_todos()?;
    let todo = todos.iter_mut().find(|t| t.id == id);
    match todo {
        Some(t) => {
            t.done = true;
            save_todos(&todos)?;
            println!("Done: {}", t.text);
        }
        None => {
            anyhow::bail!("Todo with id {} not found", id);
        }
    }
    Ok(())
}

pub fn delete_todo(id: usize) -> Result<()> {
    let mut todos = load_todos()?;
    let initial_len = todos.len();
    todos.retain(|t| t.id != id);
    if todos.len() == initial_len {
        anyhow::bail!("Todo with id {} not found", id);
    }
    save_todos(&todos)?;
    println!("Deleted item {id}");
    Ok(())
}
\`\`\`

**What I learned:**

- \`#[derive(Serialize, Deserialize)]\` is pure magic. Add two derive macros and suddenly your struct can become JSON and back. No boilerplate.
- The \`?\` operator propagates errors, but you can also use \`anyhow::bail!()\` for custom error messages.
- \`.iter_mut()\` lets you modify items while iterating. This took me a second to get comfortable with.
- \`.retain()\` is like \`filter\` but for in-place mutation — removes elements that don't match the predicate.
- Don't forget \`text.to_string()\` — Rust strings are finicky about types.

---

## Reflections

Three tools, three different lessons:

1. **grep-clone** taught me about iterators and chaining
2. **wc-clone** taught me about iterator aggregation and Unicode
3. **todo-cli** taught me about persistence and the \`?\` operator

The \`?\` operator alone has made my Rust code so much cleaner. No more nested \`match\` statements for error handling.

I'll be honest — there were moments of frustration. The Rust compiler is strict, and that's a good thing, but it does mean things take longer than you'd expect. Every error message is actually helpful though, which is more than I can say for most languages.

Next up in the series: more tools, more concepts. The journey continues.

---

*All code snippets are from my [rust-learning-bytes](https://github.com/Suhird/rust-learning-bytes) repository.*
`;export{t as default};
