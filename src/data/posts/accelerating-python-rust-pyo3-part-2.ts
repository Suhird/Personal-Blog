import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "accelerating-python-rust-pyo3-part-2",
  title: "Accelerating Python with Rust & PyO3 (Part 2: Real-World Data Processing)",
  description: "Processing large CSV and log files with Rust. Passing data between Python and Rust, chunked processing, and realistic benchmarks.",
  date: "October 22, 2025",
  tags: ["Rust", "Python", "Performance", "PyO3"],
  readTime: "9 min",
  slug: "accelerating-python-rust-pyo3-part-2",
  markdownFile: "accelerating-python-rust-pyo3-part-2",
  series: {
    id: "accelerating-python-rust",
    title: "Accelerating Python with Rust & PyO3",
    order: 2,
  },
};
