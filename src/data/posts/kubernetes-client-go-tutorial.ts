import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "kubernetes-client-go-tutorial",
  title: "Interacting with Kubernetes Client-Go",
  description: "Learn how to programmatically interact with a Kubernetes cluster using the official client-go library.",
  date: "November 5, 2025",
  tags: ["Go","Kubernetes","DevOps"],
  readTime: "14 min",
  slug: "kubernetes-client-go-tutorial",
  markdownFile: "kubernetes-client-go-tutorial",
  series: {
    id: "k8s-tui",
    title: "Building a K8s TUI",
    order: 2,
  },
};
