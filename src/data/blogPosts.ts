import { BlogPost } from "@/components/BlogCard";
import { post as learningRustPart1 } from "./posts/learning-rust-with-example-part-1";
import { post as introductionGo } from "./posts/introduction-go-building-cli-tools";
import { post as acceleratingPythonWithRustPyo3 } from "./posts/accelerating-python-with-rust-pyo3";
import { post as buildingPythonExtensionsMaturin } from "./posts/building-python-extensions-maturin";
import { post as pythonVsRustBenchmarks } from "./posts/python-vs-rust-benchmarks";
import { post as goTuiPasswordManagerSetup } from "./posts/go-tui-password-manager-setup";
import { post as goTuiPasswordManagerEncryption } from "./posts/go-tui-password-manager-encryption";
import { post as goTuiPasswordManagerFeatures } from "./posts/go-tui-password-manager-features";
import { post as masteringPythonAsyncio } from "./posts/mastering-python-asyncio";
import { post as pythonMultiprocessingGuide } from "./posts/python-multiprocessing-guide";
import { post as monteCarloSimulationsPython } from "./posts/monte-carlo-simulations-python";
import { post as optimizingDockerfilesGuide } from "./posts/optimizing-dockerfiles-guide";
import { post as apiRateLimitingStrategies } from "./posts/api-rate-limiting-strategies";
import { post as grpcVsGraphqlComparison } from "./posts/grpc-vs-graphql-comparison";
import { post as btreesVsLsmTrees } from "./posts/btrees-vs-lsm-trees";
import { post as webassemblyRustPrimer } from "./posts/webassembly-rust-primer";
import { post as eventDrivenPatternsKafka } from "./posts/event-driven-patterns-kafka";

// latest blog post on top as the sequence is show on FE starting with first as latest
export const blogPosts: BlogPost[] = [
  eventDrivenPatternsKafka,
  webassemblyRustPrimer,
  btreesVsLsmTrees,
  grpcVsGraphqlComparison,
  apiRateLimitingStrategies,
  optimizingDockerfilesGuide,
  monteCarloSimulationsPython,
  pythonMultiprocessingGuide,
  masteringPythonAsyncio,
  goTuiPasswordManagerSetup,
  goTuiPasswordManagerEncryption,
  goTuiPasswordManagerFeatures,
  pythonVsRustBenchmarks,
  buildingPythonExtensionsMaturin,
  acceleratingPythonWithRustPyo3,
  learningRustPart1,
  introductionGo,
];
