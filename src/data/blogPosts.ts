import { BlogPost } from "@/components/BlogCard";
import { post as courierHttp } from "./posts/courier-http";
import { post as reviewLensAiPoweredReviewIntelligence } from "./posts/review-lens-ai-powered-review-intelligence";
import { post as financialPortfolioTuiPart1 } from "./posts/financial-portfolio-tui-part-1";
import { post as financialPortfolioTuiPart2 } from "./posts/financial-portfolio-tui-part-2";
import { post as acceleratingPythonRustPyo3Part1 } from "./posts/accelerating-python-rust-pyo3-part-1";
import { post as acceleratingPythonRustPyo3Part2 } from "./posts/accelerating-python-rust-pyo3-part-2";
import { post as webassemblyRustPrimer } from "./posts/webassembly-rust-primer";
import { post as eventDrivenPatternsKafka } from "./posts/event-driven-patterns-kafka";
import { post as transactionalOutboxPattern } from "./posts/transactional-outbox-pattern";
import { post as grpcVsGraphqlComparison } from "./posts/grpc-vs-graphql-comparison";
import { post as apiRateLimitingStrategies } from "./posts/api-rate-limiting-strategies";
import { post as optimizingDockerfilesGuide } from "./posts/optimizing-dockerfiles-guide";
import { post as pythonMultiprocessingGuide } from "./posts/python-multiprocessing-guide";
import { post as masteringPythonAsyncio } from "./posts/mastering-python-asyncio";

// latest blog post on top as the sequence is show on FE starting with first as latest
export const blogPosts: BlogPost[] = [
  courierHttp,
  reviewLensAiPoweredReviewIntelligence,
  transactionalOutboxPattern,
  eventDrivenPatternsKafka,
  webassemblyRustPrimer,

  grpcVsGraphqlComparison,
  apiRateLimitingStrategies,
  optimizingDockerfilesGuide,
  pythonMultiprocessingGuide,
  masteringPythonAsyncio,
  acceleratingPythonRustPyo3Part1,
  acceleratingPythonRustPyo3Part2,
  financialPortfolioTuiPart1,
  financialPortfolioTuiPart2,
];
