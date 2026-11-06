![Durable execution timeline](/images/blog/temporal-hero.webp)

*The event history keeps the workflow state. Workers can be replaced.*

## A retry loop with no memory

A lot of systems start with a function like this:

```python
def process_order(order_id: str):
    charge = gateway.charge(order_id)
    reserve = inventory.reserve(order_id)
    notify(order_id, "confirmed")
    return {"charge": charge, "reserve": reserve}
```

Then a request times out after the card was charged. The retry charges it again. `inventory.reserve` succeeds, but the process dies before `notify`. A deploy rolls the pod at 2 a.m. and the in-memory retry counter disappears. You add a `try/except` with `time.sleep(30)`, then a Redis lock, then a database table called `pending_jobs`, then a cron job to clean up the table. Six months later, nobody can answer the question that matters: *what happened to order 8812?*

What you end up building is a workflow engine. Temporal is one that already handles the failure cases you are about to invent.

I wrote this in two parts. This one covers durable execution, event history, deterministic replay, workflows, activities, and the retry semantics that make side effects safe. [Part two](/tech-blog/temporal-local-setup/) is the local setup with Docker, Python, and the Temporal UI.

## What durable execution means

A normal program keeps its state in memory and its progress in the call stack. If the process dies, both disappear. A durable execution engine flips that: the **event history** is the state, and the call stack is reconstructed by replaying the history.

Every time a workflow does something observable, the server appends an event:

- `WorkflowExecutionStarted`
- `ActivityTaskScheduled`
- `ActivityTaskCompleted` or `ActivityTaskFailed`
- `TimerStarted` / `TimerFired`
- `SignalReceived`
- `WorkflowExecutionCompleted`

When a worker picks up a workflow task, it runs your workflow function from the beginning. Each time the code calls an activity, the SDK checks the history. If the activity already completed, the SDK returns the recorded result instead of executing it again. If it has not run yet, the SDK schedules it and the workflow suspends. The worker can then disappear. When the activity finishes, a new worker resumes the workflow at the same logical point.

![Temporal event history and deterministic replay](/images/blog/temporal-event-history.svg)

*Replay rebuilds the decision path from the recorded events.*

This is why the workflow function must be **deterministic**. Given the same history, it must make the same decisions in the same order. If it calls `random.random()` or reads the wall clock directly, two replays can diverge, and the engine will refuse to continue. Determinism is the contract that makes replay possible.

## Workflows and activities

Temporal separates two kinds of code that most retry libraries blur.

**Workflows** are the orchestration. They decide *what* happens next. They are deterministic, replayable, and cheap. They should not do I/O, call APIs, read files, or sleep with the language's native sleep.

**Activities** are the side effects. They charge cards, send emails, write rows, call models, resize images, and talk to the network. They are retried, timed out, and must be idempotent or protected by an idempotency key.

A useful rule: if it can fail for a reason outside your process, it belongs in an activity. If it is a decision, a loop, or a wait, it belongs in the workflow.

```python
# workflows.py
from datetime import timedelta
from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from activities import charge_card, reserve_inventory, send_email

@workflow.defn
class OrderWorkflow:
    def __init__(self) -> None:
        self.shipment_confirmed = False

    @workflow.run
    async def run(self, order_id: str) -> str:
        retry = RetryPolicy(
            initial_interval=timedelta(seconds=2),
            backoff_coefficient=2.0,
            maximum_interval=timedelta(minutes=2),
            maximum_attempts=5,
            non_retryable_error_types=["CardDeclined"],
        )

        charge = await workflow.execute_activity(
            charge_card,
            order_id,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=retry,
        )

        await workflow.execute_activity(
            reserve_inventory,
            order_id,
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=retry,
        )

        # A durable timer: no worker is held for 24 hours.
        await workflow.sleep(timedelta(hours=24))

        # Wait for a human or another system. This can take days.
        await workflow.wait_condition(lambda: self.shipment_confirmed)

        await workflow.execute_activity(
            send_email,
            order_id,
            start_to_close_timeout=timedelta(seconds=20),
        )
        return charge

    @workflow.signal
    def confirm_shipment(self) -> None:
        self.shipment_confirmed = True

    @workflow.query
    def status(self) -> str:
        return "shipped" if self.shipment_confirmed else "waiting"
```

The `workflow.sleep` is not a thread sleeping. It records a timer in history and releases the worker. A day later, the timer fires and a worker resumes the workflow. You can run a million of these without a million open connections.

## Retries that do not double-charge

Temporal's retry policy is applied by the server, not by a `for` loop in your process. That matters because the retry survives worker crashes, deploys, and network partitions.

But retries alone do not make a side effect safe. You still need **idempotency**. The standard pattern is to pass a stable business key into the activity and let the downstream system enforce uniqueness:

```python
# activities.py
from temporalio import activity

@activity.defn
async def charge_card(order_id: str) -> str:
    # The payment provider deduplicates on this key.
    return await payments.charge(
        amount_cents=4999,
        currency="USD",
        idempotency_key=f"order-{order_id}-charge-v1",
    )
```

If the activity times out after the provider charged the card, the retry sends the same key. The provider returns the original charge instead of creating a second one. Temporal can retry the call. It cannot make the provider deduplicate it; that is why the key matters.

For activities that are not naturally idempotent, use a transactional outbox or a deduplication table in the same database as the side effect. The activity should be able to say, "I already did this, here is the receipt."

## Signals, queries, and the passage of time

Real workflows are not straight lines. They wait for humans, absorb events, and answer questions while they wait.

- **Signals** are asynchronous messages into a running workflow. `confirm_shipment`, `cancel_order`, `payment_received`.
- **Queries** are read-only views into workflow state. They do not mutate history.
- **Updates** are a newer primitive that can validate, mutate, and return a result synchronously.

The important property is that a workflow can wait for days or months without holding compute. This is what makes Temporal a natural fit for approval flows, subscription billing, onboarding, and AI agents that pause for human review.

## What Temporal is not

Temporal is not a message queue. It uses queues internally, but its contract is workflow state, not message delivery. It is not a cron scheduler, although it can run schedules. It is not a database, although it stores history. And it is not a magic wrapper that makes arbitrary code durable.

If you put a network call directly in a workflow, you will get non-deterministic replay and a broken workflow. If you put an infinite loop in a workflow without `continue_as_new`, you will hit history size limits. If you treat activities as pure functions, you will be surprised by duplicate emails.

It behaves more like a database transaction log than a job queue. You define a state machine, and the engine persists the transitions.

## History size and the continue-as-new escape hatch

Every workflow accumulates history. A long-running workflow that processes one event per minute for a year will produce a very large history, and replay will become expensive. Temporal solves this with **continue-as-new**: the workflow completes its current run and starts a fresh run with a clean history, carrying forward only the state you choose.

```python
@workflow.defn
class FeedProcessor:
    @workflow.run
    async def run(self, cursor: str) -> None:
        for _ in range(1000):
            batch = await workflow.execute_activity(
                fetch_batch, cursor, start_to_close_timeout=timedelta(seconds=30)
            )
            cursor = batch.next_cursor
            await workflow.execute_activity(
                index_batch, batch.items, start_to_close_timeout=timedelta(minutes=2)
            )

        if await workflow.get_current_history_length() > 10_000:
            workflow.continue_as_new(cursor)
```

That is log compaction for orchestration. The business process is continuous; the execution history is bounded.

## When to reach for Temporal

Use it when at least two of these are true:

- The process has multiple side effects that must not be duplicated.
- The process waits for minutes, days, or human approval.
- You need to know exactly what happened, in order, for every execution.
- You need retries, timeouts, and compensation without building a bespoke state machine.
- You are orchestrating AI agents, data pipelines, provisioning, payments, or order fulfillment.

Do not use it for a single API call, a stateless request/response path, or a high-throughput event firehose where every event is independent. A queue and a consumer are simpler. It is worth the extra machinery when the sequence and state are the part you need to get right.

## Where I would use it

The retry loop in the opening did what it was told. It just had no memory. Temporal keeps that memory outside the process, so a crash or a deploy does not reset the work.

The next post is the setup: a `docker-compose.yml`, a PostgreSQL-backed server, a Python worker, a starter script, a time-skipping test, and the UI screens I use when something goes wrong.

The full local setup is here: [Temporal, Part 2: A Local Workflow Stack with Docker and Python](/tech-blog/temporal-local-setup/).
