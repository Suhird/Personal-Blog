import { BlogPost } from "@/components/BlogCard";
import { post as learningRustPart1 } from "./posts/learning-rust-with-example-part-1";
import { post as optimizingDocker } from "./posts/optimizing-docker-containers-production";
import { post as introductionGo } from "./posts/introduction-go-building-cli-tools";

// latest blog post on top as the sequence is show on FE starting with first as latest
export const blogPosts: BlogPost[] = [
  learningRustPart1,
  optimizingDocker,
  introductionGo,
];
