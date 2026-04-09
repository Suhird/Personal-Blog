import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "mastering-python-asyncio",
  title: "Mastering Python AsyncIO",
  description:
    "Understand the event loop, coroutines, and tasks to write highly concurrent network-bound applications.",
  date: "2025-11-15",
  tags: ["Python", "AsyncIO", "Concurrency", "Performance"],
  readTime: "9 min",
  slug: "mastering-python-asyncio",
  markdownFile: "mastering-python-asyncio",
  series: {
    id: "python-concurrency",
    title: "Advanced Python Concurrency",
    order: 1,
  },
};
