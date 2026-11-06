import { BlogPost } from "@/components/BlogCard";
import { post as binanceHack } from "./posts/binance-6-billion-hack";
import { post as bnbBridgeExploit } from "./posts/bnb-bridge-exploit";
import { post as ebpfProgrammableKernel } from "./posts/ebpf-programmable-kernel";
import { post as localFirstCrdt } from "./posts/local-first-crdt";
import { post as webassemblyComponentsWasi } from "./posts/webassembly-components-wasi";
import { post as smallLanguageModelsEdge } from "./posts/small-language-models-edge";
import { post as gpuEconomyInference } from "./posts/gpu-economy-inference";
import { post as aiGateway } from "./posts/ai-gateway";
import { post as huggingFaceAgentIntrusion } from "./posts/hugging-face-agent-intrusion";
import { post as mcpProtocol } from "./posts/mcp-protocol";
import { post as ragAtScale } from "./posts/rag-at-scale";
import { post as promptInjection } from "./posts/prompt-injection-new-sql-injection";
import { post as durableAiAgents } from "./posts/durable-ai-agents";
import { post as temporalLocalSetup } from "./posts/temporal-local-setup";
import { post as temporalDurableExecution } from "./posts/temporal-durable-execution";
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
import { post as optimizingDockerfilesGuide } from "./posts/optimizing-dockerfiles-guide";
import { post as pythonMultiprocessingGuide } from "./posts/python-multiprocessing-guide";
import { post as masteringPythonAsyncio } from "./posts/mastering-python-asyncio";
import { post as rustByDoingPart1 } from "./posts/rust-by-doing-build-your-own-x-part-1";
import { post as canadianCarOwnership } from "./posts/canadian-car-ownership-financial-analysis";

// latest blog post on top as the sequence is show on FE starting with first as latest
export const blogPosts: BlogPost[] = [
  binanceHack,
  bnbBridgeExploit,
  ebpfProgrammableKernel,
  localFirstCrdt,
  webassemblyComponentsWasi,
  smallLanguageModelsEdge,
  gpuEconomyInference,
  aiGateway,
  huggingFaceAgentIntrusion,
  mcpProtocol,
  ragAtScale,
  promptInjection,
  durableAiAgents,
  temporalLocalSetup,
  temporalDurableExecution,
  canadianCarOwnership,
  courierHttp,
  reviewLensAiPoweredReviewIntelligence,
  transactionalOutboxPattern,
  eventDrivenPatternsKafka,
  webassemblyRustPrimer,
  grpcVsGraphqlComparison,
  optimizingDockerfilesGuide,
  pythonMultiprocessingGuide,
  masteringPythonAsyncio,
  acceleratingPythonRustPyo3Part1,
  acceleratingPythonRustPyo3Part2,
  financialPortfolioTuiPart1,
  financialPortfolioTuiPart2,
  rustByDoingPart1,
];
