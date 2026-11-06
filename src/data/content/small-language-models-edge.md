![Small language model pipeline](/images/blog/slm-distillation-pipeline.svg)

*The best model is the smallest one that passes your eval set and fits the latency budget.*

## The 70B model classifying support tickets

A team uses a frontier model to label support tickets into five categories. It works. It also costs more than the support tool itself, adds 1.2 seconds of latency, and sends customer text to a third party.

The task is a five-way classification with a known label set and thousands of historical examples. A 3B model fine-tuned on those examples can match the frontier model's accuracy, run in 80 milliseconds on a laptop, and never send data off the device.

This is the case for small language models (SLMs): not "small models are as good as large models," but "most production tasks are narrower than the benchmark." When the task is narrow, the data is yours, and the latency budget is tight, a small model is often the better engineering choice.

## When small wins

Small models are a good fit when:

- the task is classification, extraction, routing, tagging, or short-form generation
- you have or can generate high-quality labeled examples
- latency matters (on-device, edge, high-QPS APIs)
- data cannot leave the device or region
- the cost per call must be near zero
- the output schema is fixed and verifiable

They are a poor fit when:

- the task requires broad world knowledge or multi-step reasoning
- the input is long and ambiguous
- the cost of a wrong answer is high and verification is hard
- you cannot evaluate quality rigorously
- you need tool use across many unfamiliar APIs

The honest framing: an SLM is a **specialist**, not a smaller generalist. Treat it like a fine-tuned classifier with natural-language output, not like a junior frontier model.

## The pipeline: distill, fine-tune, quantize, evaluate

### 1. Define the task and the eval set

Before touching a model, write down:

- the exact input and output schema
- the label set or output format
- the acceptance threshold
- the failure modes that matter (false negatives, unsafe content, refusal)
- a held-out eval set that you will not train on

If you cannot measure the task, you cannot ship a small model.

### 2. Generate teacher data

Use a strong model to label or generate examples, then filter aggressively. The student learns the teacher's mistakes as well as its strengths.

A practical loop:

1. Sample real inputs from production or a representative corpus.
2. Have the teacher produce outputs with rationales.
3. Validate the outputs with a schema and, where possible, a verifier.
4. Keep only examples that pass.
5. Add human-labeled examples for the edge cases the teacher gets wrong.

Data quality dominates model size. A 1B model trained on 20,000 clean, diverse examples often beats a 7B model trained on 200,000 noisy ones.

### 3. Fine-tune

For most teams, supervised fine-tuning (SFT) on instruction/response pairs is enough. Parameter-efficient methods (LoRA, QLoRA) keep costs manageable. If you need to shape preferences or refusal behavior, add a preference-tuning step with human or model feedback.

Key hyperparameters:

- learning rate and schedule
- sequence length (match your real inputs)
- packing / masking so padding does not dominate
- early stopping on the held-out eval
- seed variance: train at least three seeds and report the spread

A single run that happens to score well is not evidence. Small models are sensitive to initialization and data order.

### 4. Quantize for the target hardware

Quantization is where the model meets the device:

| Format | Typical use | Trade-off |
|---|---|---|
| FP16/BF16 | GPU serving baseline | largest memory |
| FP8 | newer GPUs | good quality, hardware-dependent |
| INT8 | CPUs, older GPUs | small quality loss |
| 4-bit GPTQ/AWQ | single GPU, edge | fits larger models, task-dependent loss |
| GGUF Q4/Q5 | CPU / Apple Silicon | optimized for llama.cpp |

Measure quality after quantization, not before. A model that is 1 point worse on a benchmark may be 5 points worse on your task. Quantization interacts with fine-tuning: quantize after training, and evaluate on the quantized artifact you will actually ship.

### 5. Evaluate on the real distribution

Your eval must include:

- **Accuracy / F1** on the held-out set
- **Calibration**: does confidence correlate with correctness?
- **Schema validity**: can the output be parsed every time?
- **Refusal behavior**: does it refuse when it should, and only then?
- **Safety**: jailbreak and prompt-injection suites
- **Latency**: p50/p95 on the target device
- **Memory**: peak RSS / VRAM
- **Cost**: tokens per second per dollar

If the SLM is within 2–3 points of the larger model on your task, ship the SLM and route the hard cases to the larger model.

## The hybrid pattern

The most practical deployment is not "replace the big model." It is a router:

```text
input -> SLM (fast, local)
           |
           +-- high confidence + schema valid -> return
           |
           +-- low confidence / invalid -> escalate to large model
```

This gives you the average cost and latency of the small model with the tail quality of the large one. The router itself can be a small classifier or a simple confidence threshold on the SLM's logprobs.

Measure the escalation rate. If it is above 20–30%, either the SLM needs better data or the task is not a good fit.

## Edge deployment

On-device inference has different constraints:

- **Memory bandwidth** usually dominates decode speed, not FLOPs.
- **Thermals** throttle long generations; short outputs are kinder.
- **Battery** matters; batch and cache aggressively.
- **Model updates** are app updates; version and roll back carefully.
- **Privacy** is the win: data never leaves the device.

Runtimes to consider:

- **llama.cpp** for CPU and Apple Silicon, with GGUF quantization
- **ONNX Runtime** for cross-platform CPU/GPU
- **Core ML** on Apple platforms
- **WebGPU** for browser-side inference
- **MLX** on Apple Silicon for research and local serving

A 3B model at 4-bit can fit in a few gigabytes and generate tens of tokens per second on a modern laptop. That is enough for classification, extraction, autocomplete, and short assistants.

## What small models are bad at

Be honest about the limits:

- **Long-context reasoning**: smaller models lose track of details sooner.
- **Tool use**: they are more likely to call the wrong tool or malform arguments.
- **Instruction conflicts**: they are easier to distract and easier to jailbreak.
- **World knowledge**: they memorize less and hallucinate more outside their training distribution.
- **Multi-step planning**: they benefit disproportionately from a workflow engine and explicit state.

The mitigation is architectural: constrain the task, validate the output, keep tools narrow, and put a larger model or a human at the escalation point.

## The takeaway

Small language models are not a compromise. They are a design choice for narrow, high-volume, latency-sensitive, privacy-sensitive work.

The winning pattern is:

1. Define a measurable task.
2. Generate clean teacher data.
3. Fine-tune a 1B–7B student.
4. Quantize for the target hardware.
5. Evaluate on the real distribution.
6. Route the hard cases to a larger model.

The 3B sweet spot is real, but it is earned with data and evaluation, not chosen from a leaderboard.
