import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "streaming-k8s-events-terminal",
  title: "Streaming K8s Events to the Terminal",
  description: "Combine tview and client-go to create a real-time stream of Kubernetes events in your terminal.",
  date: "November 10, 2025",
  tags: ["Go","Kubernetes","TUI"],
  readTime: "8 min",
  slug: "streaming-k8s-events-terminal",
  markdownFile: "streaming-k8s-events-terminal",
  series: {
    id: "k8s-tui",
    title: "Building a K8s TUI",
    order: 3,
  },
};
