import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "transactional-outbox-pattern",
  title: "The Transactional Outbox Pattern",
  description: "Solving the Dual Write problem in microservices using the Outbox Pattern.",
  date: "2026-01-14",
  tags: ["Kafka", "Architecture", "Patterns", "Microservices"],
  readTime: "10 min",
  slug: "transactional-outbox-pattern",
  markdownFile: "transactional-outbox-pattern",
  series: {
    id: "event-driven-patterns",
    title: "Event-Driven Patterns",
    order: 2,
  },
};
