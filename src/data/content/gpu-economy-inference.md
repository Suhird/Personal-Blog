![Inference cost stack](/images/blog/inference-cost-stack.svg)

*GPU hours are the denominator. Tokens are the numerator. Utilization is the multiplier nobody budgets for.*

## The bill that did not match the demo

A team prototypes a document assistant on a single A100. It feels fast and cheap. They launch, traffic grows, and the monthly GPU bill arrives at roughly the cost of a small engineering team. The model did not get bigger. The prompts did not get much longer. The problem is that the GPU was idle most of the time, and the architecture had no idea.

Inference cost is not a model price list. It is an operations problem: how many tokens per second can you produce per dollar, at the latency your users will tolerate? The answer is driven by batching, memory bandwidth, context length, quantization, caching, and routing.

This is a practical guide to the levers, in the order they usually pay off.

## The unit economics

Start with the equation:

```text
cost per 1M output tokens =
    (GPU $/hour × hours used) / output tokens produced
  + idle time
  + retries and wasted generations
  + cache misses
```

The provider's per-token price is a packaged version of this. If you self-host, you own every term.

Two numbers matter more than the rest:

- **Throughput**: tokens per second across the whole deployment.
- **Goodput**: tokens per second that satisfy the latency SLO. A batch that finishes in 30 seconds when the user leaves at 5 is not goodput.

A deployment that produces 10,000 tokens/s at 95% utilization is dramatically cheaper than one that produces 2,000 tokens/s at 20% utilization, even on the same hardware.

## Prefill and decode are different workloads

A transformer inference request has two phases:

- **Prefill**: process the input tokens in parallel. Compute-bound. Scales well with GPU FLOPs and batching.
- **Decode**: generate output tokens one at a time. Memory-bandwidth-bound. The KV cache grows with context and batch size.

This is why long prompts and long outputs have different cost profiles. A 100k-token input is a prefill problem; a 4k-token output is a decode problem. Optimizations that help one may not help the other.

The KV cache is the hidden memory cost. It scales with:

```text
KV bytes ≈ 2 × layers × heads × head_dim × sequence_length × batch_size × bytes_per_element
```

At long context and high batch size, the KV cache can exceed the model weights. That is why context length is a cost multiplier, not a free feature.

## Lever 1: continuous batching

Static batching waits for a batch to fill, runs it, and waits again. Continuous batching admits new requests as slots free up, so the GPU stays busy while sequences finish at different times.

This is the single biggest throughput win for serving. It is also why a naive "one request per GPU" service is so expensive: it leaves most of the hardware idle.

The trade-off is latency. Larger batches improve throughput but increase queueing delay and time to first token. Tune the maximum batch size against your p95 SLO, not against the benchmark's tokens/s.

## Lever 2: quantization

Quantization reduces the precision of weights and activations:

- **FP16/BF16**: baseline for most serving.
- **FP8**: good quality/throughput trade-off on newer GPUs.
- **INT8**: widely supported, usually small quality loss.
- **4-bit (GPTQ, AWQ, GGUF)**: fits larger models on smaller GPUs, but quality varies by task.

The win is not just memory. Lower precision can increase memory bandwidth efficiency, which directly speeds up decode. The risk is quality regression on edge cases: structured output, math, code, and long-context reasoning.

Always measure on your eval set. A 4-bit model that is 2 points worse on a benchmark may be fine for classification and unacceptable for contract analysis.

## Lever 3: caching

Three caches, in order of safety:

1. **Prefix cache**: reuse the KV cache for a shared system prompt or document. If 80% of your prompt is identical across requests, this is nearly free throughput.
2. **Exact response cache**: hash the normalized request and return the previous response for deterministic calls. Great for FAQs, classification, and extraction.
3. **Semantic cache**: embed the request and reuse an answer above a similarity threshold. Powerful, but risky for factual or tenant-specific content.

For agents, prefix caching is the biggest win because the system prompt and tool definitions are large and repeated. Design prompts so the stable prefix comes first and the variable content comes last.

## Lever 4: routing and model right-sizing

Most traffic does not need a frontier model. A router can classify requests and send them to the cheapest model that meets quality:

- simple extraction, classification, formatting → small model
- multi-step reasoning, ambiguous policy → large model
- code review, long-context analysis → specialized or large model
- sensitive data → self-hosted model

A common pattern is **cascade**: try the small model, validate the output, escalate only on failure. If 70% of requests succeed at the small tier, the blended cost drops sharply.

Measure the escalation rate and the quality of the small tier. A router that escalates 90% of the time is just adding latency.

## Lever 5: context discipline

Context is expensive three times: prefill compute, KV memory, and per-token price. Treat it like a budget.

- Summarize conversation history instead of appending forever.
- Retrieve fewer, better chunks (see [RAG at Scale](/tech-blog/rag-at-scale/)).
- Put stable instructions first, variable data last.
- Cap output tokens; streaming does not reduce cost, it just hides latency.
- Use structured outputs to avoid verbose prose when a JSON object will do.

A 32k-token prompt that could be 4k is an 8× prefill cost and a much larger KV cache. The cheapest token is the one you do not send.

## A simple cost model

You can build a useful estimator in a few lines:

```python
def cost_per_million(
    gpu_hourly_usd: float,
    tokens_per_second: float,
    utilization: float,
    output_ratio: float = 1.0,
) -> float:
    effective_tps = tokens_per_second * utilization
    seconds_per_million = 1_000_000 / effective_tps
    gpu_hours = seconds_per_million / 3600
    return gpu_hours * gpu_hourly_usd / output_ratio

# Example: $2.50/hr GPU, 2,000 tok/s peak, 65% utilization
print(cost_per_million(2.50, 2000, 0.65))  # ~$0.53 per 1M tokens
```

This ignores prefill/decode mix, memory limits, and retries, but it exposes the key sensitivity: utilization. At 20% utilization, the same GPU costs more than three times as much per token.

## Measuring the right things

Instrument every deployment with:

- **Tokens/s** overall and per request
- **Time to first token** and **inter-token latency**
- **Queue depth** and **batch size**
- **GPU utilization** and **memory utilization**
- **KV cache hit rate** and **prefix cache hit rate**
- **Goodput** at the p95 SLO
- **Cost per 1M tokens**, split by input and output
- **Error rate and retry rate**

If you only watch GPU utilization, you will optimize for a busy GPU, not a cheap one. A GPU at 100% utilization producing low-value tokens is still burning money.

## Buy, rent, or self-host

- **API providers**: zero ops, pay per token, good for spiky or low-volume workloads. The per-token price includes the provider's utilization advantage.
- **Reserved GPU instances**: cheaper for steady high utilization, but you own the idle time.
- **Spot instances**: cheap for batch and fault-tolerant workloads, not for synchronous user traffic without a fallback.
- **Serverless GPU**: good for bursty workloads, but cold starts and per-second billing can surprise you.

The break-even point is utilization. At low volume, APIs win. At high, steady volume with a tuned serving stack, self-hosting can be 3–10× cheaper. The crossover depends on your model size, latency SLO, and how much engineering time you are willing to spend.

## The takeaway

Inference cost engineering is not a quest for the cheapest GPU. It is the discipline of keeping the hardware busy with useful tokens:

1. Batch continuously.
2. Quantize and measure.
3. Cache the stable prefix.
4. Route to the smallest model that works.
5. Treat context as a budget.
6. Measure cost per million tokens, not GPU utilization.

The model is a fixed input. The utilization, batching, and routing are the variables you control. That is where the bill is won.
