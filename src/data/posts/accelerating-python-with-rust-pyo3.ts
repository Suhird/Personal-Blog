import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "accelerating-python-with-rust-pyo3",
  title: "Accelerating Python with Rust & PyO3",
  description: "Learn how to speed up your Python code by rewriting critical bottlenecks in Rust using PyO3.",
  date: "October 15, 2025",
  tags: ["Rust","Python","Performance","PyO3"],
  readTime: "7 min",
  slug: "accelerating-python-with-rust-pyo3",
  markdownFile: "accelerating-python-with-rust-pyo3",
  series: {
    id: "rust-python",
    title: "Rust for Python Performance",
    order: 1,
  },
};
