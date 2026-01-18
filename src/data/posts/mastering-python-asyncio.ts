import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "mastering-python-asyncio",
  title: "Mastering Python AsyncIO",
  description: "Understand the event loop, coroutines, and tasks to write highly concurrent network-bound applications.",
  date: "November 15, 2025",
  tags: ["Python","AsyncIO","Concurrency"],
  readTime: "9 min",
  slug: "mastering-python-asyncio",
  markdownFile: "mastering-python-asyncio",
  series: {
    id: "python-concurrency",
    title: "Advanced Python Concurrency",
    order: 1,
  },
};
