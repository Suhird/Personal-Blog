import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "go-tui-password-manager-encryption",
  title: "Building a Password Manager TUI (Part 2: Encryption)",
  description: "Implementing military-grade AES-GCM encryption to securely store your credentials on disk.",
  date: "November 5, 2025",
  tags: ["Go","Security","AES-GCM"],
  readTime: "13 min",
  slug: "go-tui-password-manager-encryption",
  markdownFile: "go-tui-password-manager-encryption",
  series: {
    id: "go-password-manager",
    title: "Building a Password Manager TUI",
    order: 2,
  },
};
