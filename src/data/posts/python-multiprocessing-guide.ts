import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "python-multiprocessing-guide",
  title: "True Parallelism with Multiprocessing",
  description: "Bypassing the GIL: How to use the multiprocessing module for CPU-bound tasks in Python.",
  date: "November 20, 2025",
  tags: ["Python","Multiprocessing","Performance"],
  readTime: "11 min",
  slug: "python-multiprocessing-guide",
  markdownFile: "python-multiprocessing-guide",
  series: {
    id: "python-concurrency",
    title: "Advanced Python Concurrency",
    order: 2,
  },
};
