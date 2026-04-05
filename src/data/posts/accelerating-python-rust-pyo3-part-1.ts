import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "accelerating-python-rust-pyo3-part-1",
  title: "Accelerating Python with Rust & PyO3 (Part 1: Getting Started)",
  description: "Learn how to speed up Python by rewriting bottlenecks in Rust using PyO3. Setting up maturin, your first functions, and benchmarking.",
  date: "October 15, 2025",
  tags: ["Rust", "Python", "Performance", "PyO3"],
  readTime: "8 min",
  slug: "accelerating-python-rust-pyo3-part-1",
  markdownFile: "accelerating-python-rust-pyo3-part-1",
  series: {
    id: "accelerating-python-rust",
    title: "Accelerating Python with Rust & PyO3",
    order: 1,
  },
};
