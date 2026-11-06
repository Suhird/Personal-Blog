![Local Hermes stack](/images/blog/hermes-local-stack.svg)

I wanted an agent that could read a repo, run a command, and summarize the result without sending the whole conversation to a hosted API. Most of my work is local, and I already had the hardware. I installed Hermes Agent, pointed it at a local Qwen model, and used it for a week of small tasks: file searches, shell commands, note cleanup, and a few code edits.

Here is the setup, how the tool loop works, and the numbers I measured on this machine.

## The machine

| Part | Spec |
|---|---|
| CPU | AMD Ryzen AI MAX+ 395, 16 cores / 32 threads |
| GPU | Radeon 8060S integrated |
| Memory | 91 GiB usable, unified between CPU and GPU |
| Swap | 92 GiB swapfile + 92 GiB zram |
| OS | Omarchy Linux (Arch), kernel 7.2.15 |
| Root disk | 798 GB, about 181 GB free |

This is a Strix Halo box, so the GPU does not have a separate pool of VRAM in the usual sense. It shares the system memory. The BIOS reserves some of the physical RAM for the GPU, which is why `free -h` shows 91 GiB rather than the installed amount.

That shared pool is the reason a 35B model is practical here. It is also the reason other open applications matter. A browser with a lot of tabs and a 22 GB model are drawing from the same memory.

## What Hermes Agent is doing

Hermes is an agent runtime, not another chat UI. The part I care about is the loop:

1. Hermes sends the model a system prompt, the conversation, and a list of tool schemas.
2. The model answers with either text or a tool call.
3. Hermes checks the call against the approval policy, runs it, and appends the result.
4. The model sees the result and decides what to do next.

The tool call is not executed by the model. The model only emits a name and JSON arguments. Hermes owns the execution, the working directory, the timeout, and the permission check. That separation is what makes a local agent usable without giving a 35B model direct access to everything.

![Hermes tool loop](/images/blog/hermes-tool-loop.svg)

Hermes ships with a large tool registry. The categories I actually use:

- **Terminal and files:** `terminal`, `process`, `read_file`, `patch`
- **Web:** `web_search`, `web_extract`
- **Browser:** `browser_exec`, `browser_cdp`
- **Memory and sessions:** `memory`, `session_search`
- **Orchestration:** `delegate_task`, `execute_code`, `todo`, `clarify`
- **Automation:** `cronjob`
- **Integrations:** MCP servers and plugins

There are more tools for vision, image generation, speech, messaging, and so on. For a local model, the size of that tool list matters. Every enabled tool adds schema text to the prompt, and that prompt has to be processed before the model can produce the first token.

I keep the toolset narrow for day-to-day work. A typical session uses `-t file,terminal,web` or `-t file,terminal`. The full set is useful when I need it, but it makes the first response slower.

## The model and the runtime

The model is `Qwen3.6-35B-A3B-UD-Q4_K_M`. It is a mixture-of-experts model with 35B total parameters and about 3B active per token. That is why it generates faster than a dense 35B model would on the same hardware.

The GGUF is 22 GB. There is also an 861 MB vision projector, so the model can look at screenshots and images. Hermes picked the `UD-Q4_K_M` build and a 262,144-token context during setup.

The runtime is the llama.cpp Vulkan build that Hermes manages, version `b11671`. The preset that Hermes wrote is more interesting than the default:

```ini
[Qwen3.6-35B-A3B-UD-Q4_K_M]
ctx-size = 262144
spec-type = draft-mtp
spec-draft-n-max = 2
batch-size = 4096
ubatch-size = 2048
cache-type-k = q8_0
cache-type-v = q8_0
flash-attn = on
model = /home/suhird/.hermes/models/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf
mmproj = /home/suhird/.hermes/models/assets/mmproj-Qwen3.6-35B-A3B-BF16.gguf
```

The parts that mattered for me:

- **`cache-type-k q8_0` and `cache-type-v q8_0`** keep the KV cache from eating the whole memory pool at long context.
- **`flash-attn on`** is required for usable long-context performance.
- **`spec-type = draft-mtp`** uses the model's multi-token prediction heads as a draft. It is not a separate draft model, so there is no second file to manage.
- **`batch-size 4096` / `ubatch-size 2048`** gave better prefill throughput than the smaller defaults on this GPU.

Hermes unloads an idle model after 15 minutes. The next message pays a short reload cost, then the model stays resident. I have not tried to keep it loaded permanently; the memory is more useful to other applications when I am not using the agent.

## Setup

I used the desktop app for the first install, then switched to the CLI for scripted tests.

The short version:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes --version
hermes doctor
hermes model
```

In `hermes model`, choose **Local models**. Hermes downloads the llama.cpp engine for the detected backend, lists models that fit the machine, and starts the server. On this box it selected Vulkan, which is the right default for the Radeon 8060S.

If you already have a GGUF file, point Hermes at it instead of downloading another copy. The Local Models screen has an **Add model file** option. Hermes reads the file and chooses a context window and memory placement from the model metadata.

For a manual server, the launch command is close to this:

```bash
llama-server \
  --host 127.0.0.1 \
  --port 18434 \
  --model ~/.hermes/models/Qwen3.6-35B-A3B-UD-Q4_K_M.gguf \
  --mmproj ~/.hermes/models/assets/mmproj-Qwen3.6-35B-A3B-BF16.gguf \
  --ctx-size 262144 \
  --batch-size 4096 \
  --ubatch-size 2048 \
  --cache-type-k q8_0 \
  --cache-type-v q8_0 \
  --flash-attn on \
  --spec-type draft-mtp \
  --spec-draft-n-max 2 \
  --jinja \
  --metrics \
  --slots \
  --no-webui \
  --api-key local-only
```

Then the Hermes config is just:

```yaml
model:
  default: Qwen3.6-35B-A3B-UD-Q4_K_M
  provider: llamacpp
  base_url: http://127.0.0.1:18434/v1
  api_mode: chat_completions
```

I do not put the local API key in this file. For a loopback-only server it is mostly a guard against accidental requests from another local process. If you expose the port, use a real key and a firewall rule.

`hermes doctor` is worth running before you blame the model. It checks the Python environment, the config, the database, the local runtime, and the MCP servers. On my machine it also caught a 1.9 GB cache directory that no pruner was cleaning.

## Measured speed

I tested the server directly with the OpenAI-compatible endpoint, not through Hermes. That separates model speed from agent overhead.

A 4,354-token prompt and a 220-token answer:

| Metric | Result |
|---|---|
| Prompt processing | 3.18 s |
| Prompt throughput | 1,368 tokens/s |
| Generation | 2.39 s |
| Generation throughput | 91.5 tokens/s |
| Total wall time | 5.61 s |
| Draft tokens accepted | 139 / 160 |

A shorter prompt and a 160-token answer produced 83.8 tokens/s, with 136.6 tokens/s prompt processing. The shorter run has more per-request overhead, so I trust the long run more.

The speed is good enough that the model is not the bottleneck for most of my tasks. Reading a 4,000-token file takes about three seconds before the first output token. Generating a 200-token answer takes another two and a half seconds. A full agent turn is slower because Hermes sends a much larger system prompt and the enabled tool schemas.

For comparison, a one-shot Hermes task that ran `pwd` and replied with the path took about 5.1 seconds end to end. That includes the prompt, one tool call, and the final answer. The model was already loaded. A cold start adds a few seconds for the model load.

Memory during the long run:

- GGUF: 22 GB
- Vision projector: 861 MB
- GPU-addressable memory (GTT): about 34 GB used
- Dedicated VRAM: about 2 GB used
- System memory: about 45 GB used in total, including the desktop and browser

Those numbers move with context length and other applications. The 262k context setting is a ceiling, not a promise that every session can use it comfortably.

## How it handled tools

The first test was a simple function-call check, outside Hermes. I gave the model a `get_weather` schema and asked for the weather in Toronto. It produced:

```json
{"name":"get_weather","arguments":{"city":"Toronto"}}
```

The call was correct. The part I did not expect was the token count: 446 completion tokens for a single tool call, most of them in `reasoning_content`. The final JSON was short, but the model spent a lot of budget thinking before it emitted the call.

That matters for an agent. A local model that generates at 90 tokens/s can still feel slow if it burns 400 tokens of reasoning before every tool call. Hermes exposes a reasoning setting; I use `--reasoning low` or `none` for routine file and shell tasks, and raise it only when the task needs planning.

The second test was through Hermes itself. I asked it to list the markdown files in `src/data/content` and count them, using the file and terminal tools. It ran the command and returned `29`. No manual step, no cloud call. The same setup handled a simple `pwd` task in about five seconds.

Tool calls work, but they are not free. The system prompt, tool descriptions, and conversation history all go through prefill on every turn. With a local model, prefill is fast on this GPU, but it is still the reason the first token takes longer than the generation speed suggests.

## What works well

- **File and shell tasks.** Reading a file, finding a symbol, running a test, and summarizing the output is the sweet spot. The model is good at short, concrete commands.
- **Offline work.** Once the model is downloaded, nothing leaves the machine. That is the main reason I set this up.
- **Vision.** The projector works for screenshots and simple diagrams. I would not use it for dense charts.
- **Privacy.** I can paste internal notes and logs without thinking about a provider's retention policy.
- **Cost.** The marginal cost of a request is electricity. The upfront cost is the machine and the time spent setting it up.

## What does not work well

- **Long agent sessions.** The context fills, compression kicks in, and quality drops. This is a 35B model, not a frontier model. I keep sessions short and start fresh for a new task.
- **Tool schema overhead.** Every enabled tool adds prompt tokens. The full Hermes toolset is large. Narrow toolsets are faster and produce fewer confused tool choices.
- **Reasoning token burn.** The model likes to think before acting. On a local box that is visible as a delay. Set a reasoning budget that matches the task.
- **Shared memory pressure.** The GPU uses system RAM. A 22 GB model plus a long KV cache plus a browser can push the machine into swap. I close what I do not need before a long session.
- **Hard reasoning.** It is weaker than the hosted frontier models on ambiguous, multi-step problems. For code edits and command execution it is fine. For architecture decisions I still use a larger model.
- **Occasional formatting drift.** Local models are less consistent with tool-call formats than the big hosted models. Hermes handles most of it, but I still read the command before approving it.

## Settings I would change first

1. **Narrow the toolset.** Start with `file,terminal` and add `web` or `browser` only when the task needs it.
2. **Lower reasoning for routine work.** `--reasoning low` is enough for file search, shell commands, and summaries.
3. **Keep the context realistic.** The preset allows 262k, but I rarely need more than 32k. Long contexts cost memory and prefill time.
4. **Use the quantized KV cache.** `q8_0` is a good balance on this machine. `q4_0` saves more memory if you need it.
5. **Run `hermes doctor` after updates.** The local runtime and the model presets change between releases.
6. **Approve destructive commands.** The local model is capable enough to run `rm` if you let it. I keep approvals on for anything outside a scratch directory.

## Would I keep using it?

Yes, with a narrow scope. For reading files, running commands, and summarizing local material, the setup is fast enough and private enough to be useful. The 91 GiB of unified memory is what makes the 35B model comfortable; on a 16 GB laptop I would use a much smaller model and expect a different experience.

I would not replace a hosted frontier model with it for hard reasoning or long research sessions. I would use it as the local worker for the boring, private, repetitive parts, and hand the difficult parts to a larger model when needed.

On this hardware, a 22 GB model, a Vulkan build of llama.cpp, and an agent that can call tools is fast enough to keep around for local work. I still keep a hosted model for the hard parts.
