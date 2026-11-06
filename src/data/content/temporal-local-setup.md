![Temporal local topology](/images/blog/temporal-local-topology.svg)

*A local Temporal stack: server, PostgreSQL, UI, worker, and client.*

## Why I run it locally

You can write a workflow, deploy it to a cluster, and find out whether it works. A local server is faster to iterate against: you can inspect every event in a UI and run time-skipping tests that simulate a three-day approval in milliseconds.

Part one covered the model: [Temporal, Part 1: Durable Execution and Deterministic Replay](/tech-blog/temporal-durable-execution/). This part is the setup: a local server, a Python workflow, signals, queries, and a broken worker.

There are two local options:

1. **Temporal CLI dev server** — one command, SQLite persistence, perfect for a quick start.
2. **Docker Compose** — PostgreSQL persistence, separate UI, closer to production. This is the one I recommend once you are past the first hour.

## Option 1: the one-command dev server

Install the Temporal CLI, then:

```bash
temporal server start-dev
```

By default you get:

- gRPC API on `localhost:7233`
- Temporal UI on `http://localhost:8233`
- a `default` namespace
- SQLite persistence in a local file

That is enough to run the examples below. It is not a production topology: SQLite, a single process, and no high availability. But it is excellent for learning because there is nothing else to debug.

If you want the UI on a different port:

```bash
temporal server start-dev --ui-port 8080
```

## Option 2: Docker Compose with PostgreSQL

Production Temporal separates the server roles (frontend, history, matching, worker) and uses a real database. The `temporalio/auto-setup` image gives you a single container that wires those roles together for development.

Create a directory and a `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: temporal
      POSTGRES_PASSWORD: temporal
      POSTGRES_DB: temporal
    volumes:
      - temporal-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U temporal"]
      interval: 5s
      timeout: 5s
      retries: 20

  temporal:
    image: temporalio/auto-setup:1.25.2
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB: postgres12
      DB_PORT: 5432
      POSTGRES_USER: temporal
      POSTGRES_PASSWORD: temporal
      POSTGRES_DB: temporal
      POSTGRES_SEEDS: postgres
    ports:
      - "7233:7233"

  temporal-ui:
    image: temporalio/ui:2.31.2
    depends_on:
      - temporal
    environment:
      TEMPORAL_ADDRESS: temporal:7233
      TEMPORAL_CORS_ORIGINS: http://localhost:3000
    ports:
      - "8233:8080"

  temporal-admin-tools:
    image: temporalio/admin-tools:1.25.2
    depends_on:
      - temporal
    environment:
      TEMPORAL_ADDRESS: temporal:7233
    stdin_open: true
    tty: true

volumes:
  temporal-pgdata:
```

Start it:

```bash
docker compose up -d
docker compose logs -f temporal
```

Wait for the server to report healthy, then open `http://localhost:8233`. You should see the `default` namespace. The admin tools container is useful for CLI commands:

```bash
docker compose exec temporal-admin-tools temporal operator namespace list
```

## The Python project

Use Python 3.11+ and a virtual environment:

```bash
mkdir temporal-demo && cd temporal-demo
python -m venv .venv
source .venv/bin/activate
pip install "temporalio>=1.8" pytest pytest-asyncio
```

A minimal layout:

```text
temporal-demo/
  activities.py
  workflows.py
  worker.py
  starter.py
  tests/test_workflow.py
```

### Activities: the side effects

```python
# activities.py
import asyncio
from temporalio import activity

@activity.defn
async def charge_card(order_id: str) -> str:
    # Replace with a real payment call using an idempotency key.
    await asyncio.sleep(0.2)
    activity.logger.info("charged order %s", order_id)
    return f"txn-{order_id}"

@activity.defn
async def reserve_inventory(order_id: str) -> str:
    await asyncio.sleep(0.1)
    return f"reservation-{order_id}"

@activity.defn
async def send_email(order_id: str) -> None:
    activity.logger.info("email sent for %s", order_id)
```

### Workflow: the orchestration

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
        self.approved = False

    @workflow.run
    async def run(self, order_id: str) -> str:
        retry = RetryPolicy(
            initial_interval=timedelta(seconds=1),
            backoff_coefficient=2.0,
            maximum_interval=timedelta(seconds=30),
            maximum_attempts=5,
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

        # Durable timer. No worker is held while waiting.
        await workflow.sleep(timedelta(seconds=10))

        # Wait for a signal. This can wait for days.
        await workflow.wait_condition(lambda: self.approved)

        await workflow.execute_activity(
            send_email,
            order_id,
            start_to_close_timeout=timedelta(seconds=20),
        )
        return charge

    @workflow.signal
    def approve(self) -> None:
        self.approved = True

    @workflow.query
    def status(self) -> str:
        return "approved" if self.approved else "waiting"
```

### Worker: the process that executes work

```python
# worker.py
import asyncio
from temporalio.client import Client
from temporalio.worker import Worker
from activities import charge_card, reserve_inventory, send_email
from workflows import OrderWorkflow

async def main() -> None:
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue="orders",
        workflows=[OrderWorkflow],
        activities=[charge_card, reserve_inventory, send_email],
    )
    print("worker started on task queue 'orders'")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
```

### Starter: the client

```python
# starter.py
import asyncio
import uuid
from temporalio.client import Client
from workflows import OrderWorkflow

async def main() -> None:
    client = await Client.connect("localhost:7233")
    order_id = f"order-{uuid.uuid4().hex[:8]}"

    handle = await client.start_workflow(
        OrderWorkflow.run,
        order_id,
        id=f"order-workflow-{order_id}",
        task_queue="orders",
    )
    print(f"started workflow {handle.id} for {order_id}")

    # Query the current state without mutating history.
    print("status:", await handle.query(OrderWorkflow.status))

    # Signal approval.
    await handle.signal(OrderWorkflow.approve)
    print("result:", await handle.result())

if __name__ == "__main__":
    asyncio.run(main())
```

Run the worker in one terminal and the starter in another:

```bash
python worker.py
python starter.py
```

You should see the workflow complete after the 10-second timer and the approval signal. Open the UI, find the execution, and click through the **Event History** tab. This is the part that changes how you debug distributed systems: you can see every decision, every retry, and every timer.

## Driving it from the CLI

The CLI talks to the same server:

```bash
temporal workflow list --namespace default
temporal workflow describe --workflow-id order-workflow-order-abc123
temporal workflow show --workflow-id order-workflow-order-abc123
temporal workflow signal \
  --workflow-id order-workflow-order-abc123 \
  --name approve
temporal workflow query \
  --workflow-id order-workflow-order-abc123 \
  --type status
```

If you are using Docker, prefix with `docker compose exec temporal-admin-tools`.

## Breaking it on purpose

The quickest way to see durability is to kill the worker mid-workflow.

1. Start a workflow that sleeps for 60 seconds before its next activity.
2. Stop the worker with `Ctrl+C`.
3. Wait 20 seconds.
4. Start the worker again.
5. Watch the UI: the workflow is still running, the timer is still pending, and the next activity executes exactly once.

Now try a different experiment. Add a `raise RuntimeError("boom")` to an activity, set `maximum_attempts=3`, and watch the retry schedule. Then add a `non_retryable_error_types=["InvalidOrder"]` and raise that type. The workflow fails immediately instead of retrying, because you told it the failure is not transient.

## Testing with time skipping

You do not want a test suite that waits 24 hours. Temporal's test environment can skip time:

```python
# tests/test_workflow.py
import pytest
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker
from activities import charge_card, reserve_inventory, send_email
from workflows import OrderWorkflow

@pytest.mark.asyncio
async def test_order_workflow():
    async with await WorkflowEnvironment.start_time_skipping() as env:
        async with Worker(
            env.client,
            task_queue="test-orders",
            workflows=[OrderWorkflow],
            activities=[charge_card, reserve_inventory, send_email],
        ):
            handle = await env.client.start_workflow(
                OrderWorkflow.run,
                "order-test-1",
                id="test-order-1",
                task_queue="test-orders",
            )
            await handle.signal(OrderWorkflow.approve)
            result = await handle.result()
            assert result == "txn-order-test-1"
```

The time-skipping server advances timers instantly. A workflow that waits a day in production runs in milliseconds in the test. That is the part that makes Temporal worth the setup for me: the orchestration becomes unit-testable.

## Local pitfalls

- **Wrong task queue**: the worker polls `orders`, the starter schedules on `default`. Nothing runs. Check both strings.
- **Worker not running**: the workflow sits in `Running` with a pending activity task. The UI shows it; the logs do not, because no worker is polling.
- **Namespace mismatch**: `default` is fine locally, but if you create a namespace, pass it to both client and worker.
- **Port collision**: Temporal uses `7233` for gRPC and the UI uses `8233`. Do not put the UI on `7233`.
- **Apple Silicon**: use multi-arch images or `platform: linux/amd64` if an image is not published for arm64.
- **Clock skew**: `workflow.now()` is deterministic; `datetime.now()` inside a workflow is not. Use the workflow API.
- **Native sleep**: `asyncio.sleep()` inside a workflow is not durable. Use `workflow.sleep()`.

## From laptop to production

The local stack is deliberately simple. Before production, add:

- a managed PostgreSQL with backups and replication
- multiple server roles and at least three replicas
- namespaces per environment or tenant
- mTLS between clients, workers, and the frontend
- retention and archival configured for your compliance window
- worker autoscaling on task queue backlog, not CPU alone
- dashboards for workflow task latency, activity task latency, and history size
- a versioning strategy for workflow code changes
- alerting on stuck workflows, not just failed ones

Temporal Cloud removes most of the operational surface, but the application-level rules stay the same: deterministic workflows, idempotent activities, bounded histories, and explicit versioning.

## Before production

A local stack is one compose file away. The useful part is the loop: write it, break it, replay it, and watch the history. I use the dev server for a quick look and Compose when I need PostgreSQL and the UI. The same workflow code moves to production; the checklist above is what changes.

The complete series:
- [Part 1: Durable Execution and Deterministic Replay](/tech-blog/temporal-durable-execution/)
- [Part 2: A Local Workflow Stack with Docker and Python](/tech-blog/temporal-local-setup/)
