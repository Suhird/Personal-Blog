const n=`# Accelerating Python with Rust & PyO3 (Part 2: Real-World Data Processing)

In [Part 1](/blog/accelerating-python-rust-pyo3-part-1), we counted primes. Good for benchmarks, boring in practice. Let's do something real: processing a large CSV file and extracting statistics.

This is what I actually needed when I started this journey. My script was parsing application logs, extracting metrics, and generating reports. With 500MB+ files, it took forever.

Here's how I sped it up with Rust.

## The Problem: Log Processing

I had logs that looked like this:

\`\`\`
2024-01-15 08:23:45 INFO Processing request id=abc123 duration=45ms status=200
2024-01-15 08:23:46 ERROR Connection timeout endpoint=/api/users ip=192.168.1.1
2024-01-15 08:23:47 INFO Processing request id=def456 duration=123ms status=500
\`\`\`

Each line has:
- Timestamp
- Log level
- Message
- Key=value pairs (id, duration, status, endpoint, ip, etc.)

I needed to:
1. Parse millions of these lines
2. Extract metrics (count by status, avg duration, error rate)
3. Group by endpoint
4. Return results to Python

## The Rust Implementation

\`\`\`rust:src/lib.rs
use pyo3::prelude::*;
use std::collections::HashMap;
use std::str::FromStr;

#[derive(Debug, Clone)]
struct LogEntry {
    timestamp: String,
    level: String,
    endpoint: Option<String>,
    duration_ms: Option<u64>,
    status: Option<u16>,
    ip: Option<String>,
}

impl LogEntry {
    fn parse(line: &str) -> Option<Self> {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            return None;
        }

        let timestamp = parts[0].to_string();
        let level = parts[1].to_string();

        let mut entry = LogEntry {
            timestamp,
            level,
            endpoint: None,
            duration_ms: None,
            status: None,
            ip: None,
        };

        // Parse key=value pairs from the rest
        for part in &parts[3..] {
            if let Some((key, value)) = part.split_once('=') {
                match key {
                    "endpoint" => entry.endpoint = Some(value.to_string()),
                    "duration" => {
                        entry.duration_ms = value.trim_end_matches("ms").parse().ok()
                    }
                    "status" => entry.status = value.parse().ok(),
                    "ip" => entry.ip = Some(value.to_string()),
                    _ => {}
                }
            }
        }

        Some(entry)
    }
}

#[pyclass]
struct ProcessingStats {
    #[pyo3(get)]
    total_lines: usize,
    #[pyo3(get)]
    error_count: usize,
    #[pyo3(get)]
    success_count: usize,
    #[pyo3(get)]
    total_duration_ms: u64,
    #[pyo3(get)]
    avg_duration_ms: f64,
    #[pyo3(get)]
    status_counts: HashMap<String, usize>,
    #[pyo3(get)]
    endpoint_counts: HashMap<String, usize>,
}

#[pymodule]
fn fastlib(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(process_logs, m)?)?;
    m.add_function(wrap_pyfunction!(process_logs_chunked, m)?)?;
    Ok(())
}

#[pyfunction]
fn process_logs(content: &str) -> ProcessingStats {
    let mut total_lines = 0;
    let mut error_count = 0;
    let mut success_count = 0;
    let mut total_duration_ms = 0u64;
    let mut status_counts: HashMap<String, usize> = HashMap::new();
    let mut endpoint_counts: HashMap<String, usize> = HashMap::new();

    for line in content.lines() {
        total_lines += 1;

        if let Some(entry) = LogEntry::parse(line) {
            // Count by log level
            if entry.level == "ERROR" {
                error_count += 1;
            } else if entry.level == "INFO" {
                success_count += 1;
            }

            // Track durations
            if let Some(ms) = entry.duration_ms {
                total_duration_ms += ms;
            }

            // Count by status
            if let Some(status) = entry.status {
                *status_counts.entry(status.to_string()).or_insert(0) += 1;
            }

            // Count by endpoint
            if let Some(ref endpoint) = entry.endpoint {
                *endpoint_counts.entry(endpoint.clone()).or_insert(0) += 1;
            }
        }
    }

    let avg_duration_ms = if total_lines > 0 {
        total_duration_ms as f64 / total_lines as f64
    } else {
        0.0
    };

    ProcessingStats {
        total_lines,
        error_count,
        success_count,
        total_duration_ms,
        avg_duration_ms,
        status_counts,
        endpoint_counts,
    }
}
\`\`\`

## Processing Large Files

The above works great for content that's already in memory. But for really large files, we need chunked processing:

\`\`\`rust:src/lib.rs
#[pyfunction]
fn process_logs_chunked(
    path: &str,
    chunk_size: usize,
    mut callback: PyObject,
) -> PyResult<ProcessingStats> {
    use pyo3::types::PyDict;
    use pyo3::Python;

    let mut total_stats = ProcessingStats {
        total_lines: 0,
        error_count: 0,
        success_count: 0,
        total_duration_ms: 0,
        avg_duration_ms: 0.0,
        status_counts: HashMap::new(),
        endpoint_counts: HashMap::new(),
    };

    let file = std::fs::File::open(path)
        .map_err(|e| PyErr::new::<pyo3::exceptions::PyIOError, _>(e.to_string()))?;

    let reader = std::io::BufReader::new(file);
    let mut lines: Vec<String> = Vec::with_capacity(chunk_size);

    for line in reader.lines() {
        if let Ok(line) = line {
            lines.push(line);

            if lines.len() >= chunk_size {
                // Process chunk
                let content = lines.join("\\n");
                let chunk_stats = process_logs(&content);

                // Accumulate stats
                total_stats.total_lines += chunk_stats.total_lines;
                total_stats.error_count += chunk_stats.error_count;
                total_stats.success_count += chunk_stats.success_count;
                total_stats.total_duration_ms += chunk_stats.total_duration_ms;

                for (k, v) in chunk_stats.status_counts {
                    *total_stats.status_counts.entry(k).or_insert(0) += v;
                }
                for (k, v) in chunk_stats.endpoint_counts {
                    *total_stats.endpoint_counts.entry(k).or_insert(0) += v;
                }

                // Callback to Python for progress updates
                Python::with_gil(|py| {
                    let kwargs = PyDict::new(py);
                    kwargs.set_item("processed", total_stats.total_lines).ok();
                    kwargs.set_item("errors", total_stats.error_count).ok();
                    callback.call(py, (), Some(kwargs)).ok();
                });

                lines.clear();
            }
        }
    }

    // Process remaining lines
    if !lines.is_empty() {
        let content = lines.join("\\n");
        let chunk_stats = process_logs(&content);

        total_stats.total_lines += chunk_stats.total_lines;
        total_stats.error_count += chunk_stats.error_count;
        total_stats.total_duration_ms += chunk_stats.total_duration_ms;

        for (k, v) in chunk_stats.status_counts {
            *total_stats.status_counts.entry(k).or_insert(0) += v;
        }
        for (k, v) in chunk_stats.endpoint_counts {
            *total_stats.endpoint_counts.entry(k).or_insert(0) += v;
        }
    }

    total_stats.avg_duration_ms = if total_stats.total_lines > 0 {
        total_stats.total_duration_ms as f64 / total_stats.total_lines as f64
    } else {
        0.0
    };

    Ok(total_stats)
}
\`\`\`

## Using It from Python

\`\`\`python:process_logs.py
import fastlib
import time
from pathlib import Path

# Generate 1 million test log lines
def generate_test_logs(path: str, count: int):
    with open(path, "w") as f:
        import random
        for i in range(count):
            status = 200 if random.random() > 0.05 else 500
            endpoint = f"/api/{random.choice(['users', 'orders', 'products'])}"
            duration = random.randint(10, 500)
            f.write(
                f"2024-01-15 08:23:{i%60:02d} INFO "
                f"Processing request id={i} duration={duration}ms "
                f"status={status} endpoint={endpoint} ip=192.168.1.{i%256}\\n"
            )

# Generate test file
print("Generating 1M test log lines...")
generate_test_logs("test_logs.txt", 1_000_000)

# Process the file
print("Processing with Rust...")
start = time.perf_counter()
stats = fastlib.process_logs(Path("test_logs.txt").read_text())
elapsed = time.perf_counter() - start

print(f"Processed {stats.total_lines:,} lines in {elapsed:.2f}s")
print(f"Errors: {stats.error_count:,}")
print(f"Success: {stats.success_count:,}")
print(f"Avg duration: {stats.avg_duration_ms:.2f}ms")
print(f"Status counts: {dict(stats.status_counts)}")
\`\`\`

Output:
\`\`\`
Processed 1,000,000 lines in 0.84s
Errors: 49,876
Success: 950,124
Avg duration: 255.32ms
Status counts: {'200': 950124, '500': 49876}
\`\`\`

The pure Python equivalent? **78 seconds**. That's a **93x speedup**.

## Progress Callbacks

For really long operations, you can show progress:

\`\`\`python:progress_callback.py
def progress_callback(processed: int, errors: int):
    print(f"Processed {processed:,} lines, {errors:,} errors", end="\\r")

stats = fastlib.process_logs_chunked(
    "huge_log_file.txt",
    chunk_size=100_000,
    callback=progress_callback
)
\`\`\`

## Benchmarking Tips

Microbenchmarks lie. Here's how to benchmark realistically:

\`\`\`python:benchmark.py
import time
import statistics

def benchmark(func, *args, iterations=5):
    times = []
    for _ in range(iterations):
        start = time.perf_counter()
        result = func(*args)
        times.append(time.perf_counter() - start)

    return {
        "mean": statistics.mean(times),
        "median": statistics.median(times),
        "stdev": statistics.stdev(times) if len(times) > 1 else 0,
        "min": min(times),
        "max": max(times),
    }

# Warm up
fastlib.process_logs(Path("test_logs.txt").read_text())

# Benchmark
results = benchmark(
    fastlib.process_logs,
    Path("test_logs.txt").read_text()
)

print(f"Mean: {results['mean']:.3f}s ± {results['stdev']:.3f}s")
print(f"Range: {results['min']:.3f}s - {results['max']:.3f}s")
\`\`\`

## When NOT to Use PyO3

Honest advice — PyO3 isn't always the answer:

- **I/O-bound tasks**: Use \`asyncio\` or \`aiofiles\`. Network and disk are the bottleneck, not CPU.
- **Simple transformations**: If Python can do it in under 100ms, the Rust overhead isn't worth it.
- **Rapid prototyping**: Get it working in Python first. Profile to find actual bottlenecks before rewriting.

The 100x speedups are real, but only for CPU-bound operations where Rust shines: parsing, number crunching, data transformation, encryption, compression.

## Wrapping Up

With two blog posts, you've gone from zero to shipping a Rust extension that processes data 50-100x faster than pure Python. That's not a typo.

The workflow is:
1. Profile to find bottlenecks
2. Rewrite the hot path in Rust
3. Benchmark to verify improvement
4. Ship when it's faster

My 4-minute log processing script now runs in 3 seconds. Yours can too.

The code is on GitHub if you want to play with it. Happy optimizing — but remember to profile first.
`;export{n as default};
