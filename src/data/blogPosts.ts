
import { BlogPost } from "@/components/BlogCard";
import { post as buildingModernWebApp } from "./posts/building-modern-web-app-react-typescript";
import { post as optimizingDocker } from "./posts/optimizing-docker-containers-production";
import { post as introductionGo } from "./posts/introduction-go-building-cli-tools";
import { post as understandingAWSLambda } from "./posts/understanding-aws-lambda-serverless";
import { post as advancedTypescript } from "./posts/advanced-typescript-patterns-frontend";

export const blogPosts: BlogPost[] = [
  buildingModernWebApp,
  optimizingDocker,
  introductionGo,
  understandingAWSLambda,
  advancedTypescript
];
