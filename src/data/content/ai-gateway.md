![AI gateway flow](/images/blog/ai-gateway-flow.svg)

*Every model call goes through the same gateway and telemetry path.*

## Keys in too many places

It starts with one team using one provider. Then another team uses a second, and a third runs a local model for sensitive data. The mobile app calls one provider directly, the batch pipeline calls another, and the internal agent has a key in an environment variable that nobody remembers rotating.

Then finance asks a simple question: *which feature is spending the most on inference?* Nobody can answer. The keys are scattered, the logs are in three formats, and the "fallback" is a `try/except` that silently retries the same provider.

An AI gateway puts those decisions in one place. It sits between your applications and model providers, exposes one API, and centralizes the concerns that should not be reimplemented in every service.

## What belongs in the gateway

The gateway I want does a few things:

- **Authentication and tenancy**: map an API key to a tenant, user, and scopes.
- **Quotas and rate limits**: requests per minute, tokens per day, spend per month.
- **Routing**: choose a model based on task, cost, latency, region, or canary.
- **Fallback**: fail over to another provider or model when the primary is down.
- **Caching**: exact-match and, carefully, semantic caching.
- **Guardrails**: PII redaction, prompt-injection checks, output schema validation.
- **Observability**: one trace per request with model, tokens, latency, cost, and cache status.
- **Key management**: rotate provider keys in one place, never in application code.

It should *not* own your business logic. The gateway routes and enforces policy; it is not a second application server.

## A minimal configuration

Most gateways expose an OpenAI-compatible surface, which means existing SDKs work with a base URL change. A route table can be as simple as this:

```yaml
# gateway.yaml
providers:
  openai:
    base_url: https://api.openai.com/v1
    api_key: ${OPENAI_API_KEY}
  anthropic:
    base_url: https://api.anthropic.com
    api_key: ${ANTHROPIC_API_KEY}
  local:
    base_url: http://vllm.internal:8000/v1
    api_key: ${LOCAL_API_KEY}

routes:
  - name: support-reply
    match: { tenant: "acme", task: "support" }
    primary: { provider: openai, model: "gpt-5.6-mini" }
    fallback:
      - { provider: anthropic, model: "claude-sonnet-5" }
      - { provider: local, model: "qwen3-8b-instruct" }
    limits:
      max_input_tokens: 16000
      max_output_tokens: 1200
      timeout_ms: 30000
    cache:
      exact: true
      semantic: false
    guardrails:
      - pii_redact
      - output_json_schema: support_reply_v3

  - name: code-review
    match: { tenant: "acme", task: "review" }
    primary: { provider: anthropic, model: "claude-opus-5" }
    fallback:
      - { provider: openai, model: "gpt-5.6" }
    limits:
      max_input_tokens: 120000
      max_output_tokens: 4000
```

The application sends a task name, not a provider model. The gateway owns the mapping. When a provider has an outage, you change the route table, not fifty services.

## Routing

I use four routing strategies:

1. **Static**: one model per task. Simple, predictable.
2. **Cost-based**: use the cheapest model that meets a quality threshold on your eval set.
3. **Latency-based**: route to the provider with the lowest recent p95 for this task.
4. **Canary**: send 5% of traffic to a new model, compare quality and cost, then ramp.

A useful default is **small model first, escalate on uncertainty**. Classify the request, try the cheap model, and escalate to a frontier model when the output fails validation or the model reports low confidence. This can cut spend by 60–80% on high-volume tasks.

Shadow routing is also valuable: send a copy of production traffic to a candidate model without returning its output, then compare offline. You get real distribution data without risking user experience.

## Caching

There are three kinds of cache:

- **Exact-match**: hash the normalized request (model, messages, temperature, tools). Safe and effective for deterministic calls.
- **Prefix cache**: reuse the KV cache for a shared system prompt or long document. Provider-specific but often free or cheaper.
- **Semantic**: embed the request and return a previous answer if similarity exceeds a threshold. Powerful for FAQs, dangerous for anything factual or personalized.

Semantic caching fails in the obvious way: two questions can be semantically similar and require different answers. "What is the refund window for EU customers?" and "What is the refund window for US customers?" are close in embedding space and different in policy. Use semantic caching only for a curated set of intents, with a high threshold, and always include the tenant and policy version in the cache key.

## Guardrails

Stateless guardrails fit here:

- redact PII before the prompt leaves your network
- block known prompt-injection patterns (defense in depth, not a boundary)
- validate the output against a JSON schema
- strip markdown images and links from untrusted output
- enforce max tokens and stop sequences
- log a redacted copy for audit

The gateway cannot enforce authorization for tools. That must happen at the tool boundary, because the model can be tricked. The gateway can enforce *which tools are visible* to a tenant and *which model* may call them, but the final check belongs next to the side effect.

## Observability

Use OpenTelemetry's GenAI semantic conventions where possible, and record at minimum:

- trace ID, tenant, user, feature, prompt version
- provider, model, model version
- input tokens, output tokens, cached tokens, reasoning tokens
- time to first token, total latency
- cost in USD, calculated from a versioned price table
- cache hit/miss
- guardrail decisions
- finish reason and error class

A single trace should let you answer: *why did this request cost $0.14 and take 9 seconds?* Without that, you are optimizing blind.

The cost breakdown is usually the first thing finance asks for. Tag every request with a tenant and feature, aggregate daily, and alert on anomalous spend per tenant. A runaway agent loop is much easier to stop when you can see it in a dashboard.

## Multi-tenancy and key management

Never ship a provider key to a client. The gateway holds the provider credentials; clients hold gateway keys scoped to a tenant and a set of tasks.

Key hygiene:

- rotate provider keys on a schedule and on suspicion
- store them in a secret manager, not in the route table
- use separate keys per environment and per provider
- log key IDs, never key values
- revoke immediately when a tenant or employee leaves

If you support bring-your-own-key for enterprise customers, isolate those requests and encrypt the key at rest with a per-tenant key.

## Failure modes

It sits on the critical path, so plan for failure:

- **Gateway down**: clients should have a circuit breaker and a degraded path, not an infinite retry.
- **Provider down**: fallback must be pre-tested, not discovered during an incident.
- **Streaming**: proxies must pass through server-sent events without buffering the whole response.
- **Timeout mismatch**: the gateway timeout should be shorter than the client timeout, so retries happen at the right layer.
- **Provider-specific features**: tool calls, structured outputs, and reasoning tokens differ. Normalize the common subset, and pass through provider-specific fields explicitly.
- **Version drift**: pin model versions; "latest" is not a version.
- **Cost table drift**: prices change. Version the table and recompute historical cost if needed.

## Build or buy

Managed gateways exist, and they are a good default if you want routing, caching, and observability without operating another service. Build your own when you need:

- deep integration with internal auth and tenant model
- custom guardrails or data residency
- provider-specific features the managed layer does not expose
- full control over logs and retention

Either way, keep the interface OpenAI-compatible so you can switch later. The gateway is an abstraction; do not let it become a lock-in.

## What I would put in the first version

The gateway gives you one place to rotate keys, cap spend, fail over, redact data, and attribute cost. That is enough to justify it before the number of providers grows. I would keep it boring: route, enforce, observe. The models change often; the control plane should not.
