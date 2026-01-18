import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "python-vs-rust-benchmarks",
  title: "Real-world Benchmarks: Python vs Rust",
  description: "We compare pure Python, NumPy, and Rust implementations of heavy computational algorithms.",
  date: "October 25, 2025",
  tags: ["Rust","Python","Benchmarking"],
  readTime: "12 min",
  slug: "python-vs-rust-benchmarks",
  markdownFile: "python-vs-rust-benchmarks",
  series: {
    id: "rust-python",
    title: "Rust for Python Performance",
    order: 3,
  },
};
