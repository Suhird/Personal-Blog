![Durable agent loop](/images/blog/durable-agent-loop.svg)

*The workflow holds the loop. Model and tool calls run as activities.*

## A run that restarts from zero

A team ships an AI research agent. It plans, searches, reads pages, calls a paid data API, writes a report, and asks a human to approve the final send. The average run takes 40 minutes and costs about $6 in model and tool calls.

One afternoon, the agent is 38 minutes in, holding a dozen tool results and a partially written report, when the worker pod is evicted during a node upgrade. The process dies. The orchestrator restarts it. The agent starts from the beginning, re-runs the searches, re-calls the paid API, and asks the human to approve a report it already approved. The customer sees a duplicate email. The bill shows three identical runs.

The model was fine. The process holding its state was not. The agent's state lived in a Python process and a context window, and both are ephemeral. The fix is the same one used for payments and order fulfillment: durable execution.

## Why a while loop is the wrong abstraction

The canonical agent loop looks like this:

```python
while not done:
    plan = llm.plan(goal, history)
    action = plan.next_action
    result = tools[action.name](**action.args)
    history.append(result)
```

It is elegant, and it hides five production problems:

1. **No checkpoint.** A crash loses the entire history.
2. **No idempotency.** A retried tool call can send a second email or create a second ticket.
3. **No durable wait.** Human approval means holding a process open, or losing the run.
4. **No budget enforcement.** A loop can spend without bound until someone notices.
5. **No audit trail.** You cannot reconstruct why the agent did what it did.

You can bolt each of these on with Redis, a database, a queue, and a state machine. At that point you have a workflow engine with a lot of missing pieces. Temporal gives you the primitives directly.

## The split: deterministic workflow, non-deterministic activities

The key design move is to separate *control flow* from *side effects*.

- The **workflow** owns the loop, the budget, the stop conditions, the human gates, and the state transitions. It is deterministic and replayable.
- **Activities** own the model call, the retrieval, the tool call, the file write, and the external API. They can fail, retry, time out, and be idempotent.

This split also solves a subtle problem: model outputs are non-deterministic, but the workflow must replay deterministically. Because the model call is an activity, its output is recorded in history. On replay, the SDK returns the recorded output instead of calling the model again. The workflow sees the same decision, every time.

## A durable agent in Python

Here is a compact version of the pattern. It plans, acts, observes, and pauses for approval when the action is high-impact.

```python
# agent_workflow.py
from datetime import timedelta
from dataclasses import dataclass
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from agent_activities import call_model, run_tool, save_report

@dataclass
class Step:
    thought: str
    tool: str
    args: dict

@workflow.defn
class ResearchAgentWorkflow:
    def __init__(self) -> None:
        self.approved = False
        self.cancelled = False
        self.spent_cents = 0
        self.max_cents = 800

    @workflow.run
    async def run(self, goal: str, tenant_id: str) -> str:
        history: list[dict] = []
        retry = RetryPolicy(maximum_attempts=4, initial_interval=timedelta(seconds=2))

        for step_number in range(1, 21):
            if self.cancelled:
                return "cancelled"
            if self.spent_cents >= self.max_cents:
                return "budget_exhausted"

            # Planning is an activity: the result is recorded, so replay is safe.
            step: Step = await workflow.execute_activity(
                call_model,
                args=[goal, history, tenant_id],
                start_to_close_timeout=timedelta(minutes=2),
                retry_policy=retry,
            )
            self.spent_cents += 12  # recorded in workflow state

            # High-impact actions require a human signal.
            if step.tool in {"send_email", "update_crm", "issue_refund"}:
                await workflow.wait_condition(lambda: self.approved or self.cancelled)
                if self.cancelled:
                    return "cancelled"
                self.approved = False

            observation = await workflow.execute_activity(
                run_tool,
                args=[step.tool, step.args, tenant_id, f"{workflow.info().workflow_id}:{step_number}"],
                start_to_close_timeout=timedelta(minutes=3),
                retry_policy=retry,
            )
            self.spent_cents += observation["cost_cents"]
            history.append({"step": step, "observation": observation["summary"]})

            if observation["done"]:
                report = await workflow.execute_activity(
                    save_report,
                    args=[goal, history],
                    start_to_close_timeout=timedelta(seconds=30),
                )
                return report

        return "step_limit_reached"

    @workflow.signal
    def approve(self) -> None:
        self.approved = True

    @workflow.signal
    def cancel(self) -> None:
        self.cancelled = True

    @workflow.query
    def budget(self) -> dict:
        return {"spent_cents": self.spent_cents, "max_cents": self.max_cents}
```

The framework matters less than these properties:

- The loop is bounded by a step limit and a budget.
- The model call is an activity whose output is recorded.
- Tool calls carry an idempotency key derived from the workflow ID and step number.
- Human approval is a signal, not a held connection.
- Cancellation is a signal that the workflow observes at safe points.

## Idempotency is still your job

Temporal retries activities. It does not make your tools safe to retry. If `run_tool` sends an email and the activity times out after the email was sent, the retry will send it again unless the tool deduplicates.

The pattern is the same as any payment system: pass a stable key and enforce it at the boundary.

```python
# agent_activities.py
from temporalio import activity

@activity.defn
async def run_tool(name: str, args: dict, tenant_id: str, idempotency_key: str):
    # Every tool adapter must accept the key and deduplicate.
    result = await tool_registry.execute(
        name=name,
        args=args,
        tenant_id=tenant_id,
        idempotency_key=idempotency_key,
    )
    return result
```

For read-only tools, idempotency is trivial. For writes, it decides whether a retry is safe. If a tool cannot be made idempotent, it should require human approval every time, or be wrapped in a compensating action.

## Memory: workflow state is not long-term memory

There are three different things people call "agent memory":

1. **Execution state** — the current step, budget, approvals, and observations. Temporal owns this.
2. **Conversation context** — the tokens you send to the model. You own this, and you must bound it.
3. **Long-term knowledge** — user preferences, past runs, documents. A database or vector store owns this.

They serve different purposes. Temporal history is an audit log and a replay mechanism, not a prompt. Sending the entire event history to the model is a recipe for token bills and confused agents. Instead, store a compact transcript in an activity-owned database, and pass a summarized view into the model.

A good pattern: the workflow keeps a `history` list of structured steps, but the model call activity receives only the last N steps plus a rolling summary. The summary is produced by a separate activity and cached by a content hash.

## Versioning prompts like code

An agent's behavior is a function of its prompt, model, tools, and policy. If you change the prompt mid-flight, a replaying workflow can make a different decision than the original run, which breaks determinism in spirit even if the history is intact.

Treat prompts as versioned artifacts:

```python
PROMPTS = {
    "planner:v7": "You are a research planner...",
    "planner:v8": "You are a research planner with a strict tool budget...",
}
```

Record the prompt version in the activity input or in a workflow memo. When a run is replayed or audited, you can see exactly which prompt produced each step. When you change the prompt, start new workflows on the new version; do not mutate the old one underneath running executions.

## What agents need from a runtime

Agent frameworks spend a lot of attention on the planning loop. In production, the problems are around it:

- **Durability**: a crash at step 37 resumes at step 37.
- **Observability**: every model call, tool call, token count, and cost is recorded.
- **Control**: budgets, step limits, allowlists, and human gates.
- **Recoverability**: retries with backoff, dead-letter queues, and compensating actions.
- **Auditability**: who approved what, when, and with which prompt and model.
- **Testability**: replay a recorded run, or simulate a three-day wait in milliseconds.

These are runtime concerns. That is why I keep the loop in a workflow engine and the model calls in activities.

## When not to use a workflow engine

If your agent is a single model call with one tool, a normal request handler is fine. If every run is independent, short, and stateless, a queue and a worker are simpler. If you do not need replay, approvals, or long waits, do not pay for the machinery.

I reach for it when the work has sequence, side effects, and time, which covers most agents that touch production.

## What I would keep

An agent is a distributed system with a language model in the loop. I keep the control flow in a deterministic workflow, put the model and tools in idempotent activities, record every decision, and make the human gates explicit. The model can be swapped; the runtime is what keeps a failed run from starting over.
