import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "event-driven-patterns-kafka",
  title: "Event-Driven Patterns with Kafka",
  description: "Implementing robust event-driven architectures using Apache Kafka.",
  date: "January 12, 2026",
  tags: ["Kafka","Architecture","Microservices"],
  readTime: "8 min",
  slug: "event-driven-patterns-kafka",
  markdownFile: "event-driven-patterns-kafka",
  series: {
    id: "event-driven-patterns",
    title: "Event-Driven Patterns",
    order: 1,
  },
};
