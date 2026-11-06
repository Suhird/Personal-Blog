import { BlogPost } from "@/components/BlogCard";

export const post: BlogPost = {
  id: "tandem-permit-triage",
  title: "Tandem: A Dual-Process Architecture for Municipal Permit Triage",
  description:
    "A local LLM reads the permit application. A Jev-style decision model makes the bounded routing call. Code checks the facts. A human approves. A design for high-volume permit triage, with the contract, failure modes, and measurement plan.",
  date: "2026-11-06",
  tags: ["AI", "Decision Models", "Local LLM", "Architecture"],
  readTime: "15 min",
  slug: "tandem-permit-triage",
  markdownFile: "tandem-permit-triage",
  image: "/images/blog/tandem-hero.svg",
};
