import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "1",
  title: "Learn Basic Rust - Coming from OOP languages",
  description:
    "Learn to build a basic Rust program about a Card deck and attach methods like shuffle etc to the Deck object",
  date: "May 5, 2025",
  tags: ["Rust", "Learning"],
  readTime: "5 min",
  slug: "learning-rust-with-examples-part-1",
  markdownFile: "deck_program_rust_blog",
  series: {
    id: "learning-rust",
    title: "Learning Rust",
    order: 1,
  },
};
