import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "building-python-extensions-maturin",
  title: "Building Python Extensions with Maturin",
  description: "A deep dive into packaging and publishing mixed Python/Rust projects using Maturin.",
  date: "October 20, 2025",
  tags: ["Rust","Python","DevOps","Maturin"],
  readTime: "8 min",
  slug: "building-python-extensions-maturin",
  markdownFile: "building-python-extensions-maturin",
  series: {
    id: "rust-python",
    title: "Rust for Python Performance",
    order: 2,
  },
};
