![eBPF hook points](/images/blog/ebpf-hook-points.svg)

*Attach verified programs to kernel hooks, share state through maps, and observe or steer the system without a kernel module.*

## The latency mystery

A service starts returning p99 latencies that are 40× the median. The application logs look normal. The host CPU is not saturated. The network team says the switches are fine. The database says its queries are fast.

The answer is somewhere in the kernel: a retransmit, a scheduler delay, a dropped packet, a cgroup throttling a container, a filesystem stall. Traditional tools give you snapshots and counters. You need to ask a precise question of a running system without rebuilding the kernel or restarting the process.

That is the problem eBPF was built for.

## What eBPF is

eBPF (extended Berkeley Packet Filter) is a small virtual machine inside the Linux kernel. You write a program in a restricted C-like language, compile it to eBPF bytecode, and attach it to a hook. The kernel verifies the program before running it, JIT-compiles it, and executes it when the hook fires.

The verifier is the safety contract. It proves that the program:

- terminates (bounded loops)
- only accesses memory it is allowed to access
- only calls approved helper functions
- stays within the stack and instruction limits

If the verifier cannot prove safety, the program is rejected. This is why eBPF can run in the kernel without the risk of a traditional module.

Programs share state with user space through **maps**: hash maps, arrays, ring buffers, per-CPU maps, and more. The user-space agent loads programs, reads maps, and exports metrics or events.

## The hooks that matter

eBPF can attach to many points in the kernel:

- **XDP**: the earliest point in the network receive path, before the socket stack. Used for DDoS mitigation, load balancing, and fast packet filtering.
- **tc / qdisc**: ingress and egress traffic control. Used for policy, shaping, and service mesh data planes.
- **kprobe / kretprobe**: dynamic probes on kernel functions. Powerful for debugging, fragile across kernel versions.
- **uprobe / uretprobe**: probes on user-space functions. Useful for tracing application internals without recompiling.
- **tracepoints**: stable, predefined kernel events. Preferred over kprobes when available.
- **cgroup hooks**: per-container policy and accounting.
- **LSM hooks**: security policy at the Linux Security Module layer.
- **perf events**: sampling and profiling.

The choice of hook is a trade-off between stability, overhead, and access to data.

## A minimal program

A classic example: count syscalls by process name and print the top talkers. The kernel side:

```c
// syscount.bpf.c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, __u32);      // pid
    __type(value, __u64);    // count
} counts SEC(".maps");

SEC("tracepoint/raw_syscalls/sys_enter")
int count_syscalls(struct trace_event_raw_sys_enter *ctx)
{
    __u32 pid = bpf_get_current_pid_tgid() >> 32;
    __u64 *value = bpf_map_lookup_elem(&counts, &pid);
    if (value) {
        __sync_fetch_and_add(value, 1);
    } else {
        __u64 one = 1;
        bpf_map_update_elem(&counts, &pid, &one, BPF_ANY);
    }
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

The user-space loader (using libbpf skeleton generation) attaches the program, reads the map, and prints the counts. The exact loader is boilerplate; the important part is the shape: a hook, a map, and a bounded program.

For quick experiments, Python with BCC is convenient:

```python
from bcc import BPF

program = r"""
BPF_HASH(counts, u32, u64);

int count_syscalls(void *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 zero = 0, *value;
    value = counts.lookup_or_try_init(&pid, &zero);
    if (value) {
        __sync_fetch_and_add(value, 1);
    }
    return 0;
}
"""

b = BPF(text=program)
b.attach_tracepoint(tp="raw_syscalls:sys_enter", fn_name="count_syscalls")
b.trace_print()
```

BCC is excellent for learning and one-off debugging. For production, prefer libbpf with CO-RE (compile once, run everywhere) or a Rust framework like Aya.

## What teams actually use it for

- **Networking**: Cilium uses eBPF for Kubernetes networking, load balancing, and network policy, replacing kube-proxy in many clusters.
- **Observability**: Pixie, Tetragon, and Parca use eBPF to capture traces, flows, and profiles without instrumenting every application.
- **Security**: Falco and Tetragon enforce runtime policies and detect suspicious syscalls, process executions, and network connections.
- **Performance**: continuous profiling with eBPF captures stack traces at low overhead, revealing CPU and off-CPU bottlenecks.
- **Traffic shaping**: XDP programs drop or redirect packets before they consume socket buffers.

The common thread: eBPF lets you see or control the kernel's behavior with a program that is safe enough to load into production.

## Safety and limits

The verifier is strong, but it is not a performance guarantee. A valid program can still be expensive if it runs on every packet or every syscall.

Practical rules:

- Keep programs small and branch-light.
- Use per-CPU maps to avoid contention on hot paths.
- Prefer ring buffers over perf buffers for high-volume events.
- Sample, do not trace everything.
- Measure overhead with and without the program.
- Avoid unbounded loops, even if the verifier allows bounded ones.

The verifier also constrains what you can do: no arbitrary kernel memory reads, no unbounded recursion, limited stack, and a restricted helper API. These limits are the price of safety.

## CO-RE and kernel portability

A kprobe on `tcp_sendmsg` may work on one kernel and fail on another if the function signature changes. **CO-RE** (Compile Once, Run Everywhere) uses BTF (BPF Type Format) metadata to relocate field accesses at load time, so one binary works across kernel versions.

For production:

- build with BTF support (`CONFIG_DEBUG_INFO_BTF=y`)
- use `vmlinux.h` generated from the target kernel
- avoid hard-coded offsets
- test on the oldest and newest kernels you support

This is the difference between a demo that works on your laptop and a tool that runs across a fleet.

## Operational checklist

1. **Pin the kernel versions you support.** eBPF features vary.
2. **Run with the minimum privileges.** CAP_BPF and CAP_PERFMON where possible; avoid full root.
3. **Load programs at startup, not per request.** Loading is expensive.
4. **Expose metrics and health.** A silent eBPF agent is worse than no agent.
5. **Version your programs and maps.** Rolling upgrades need compatibility.
6. **Test the unload path.** Leaked probes and maps are a slow resource leak.
7. **Measure overhead.** Compare p99 latency with the agent on and off.
8. **Have a kill switch.** You may need to detach everything in an incident.

## The takeaway

eBPF is not magic. It is a tiny virtual machine with a strict verifier, a narrow helper API, and a very good JIT. That combination lets you run safe, dynamic code inside the kernel, which is why it has replaced a generation of kernel modules and sidecar proxies for observability and networking.

The mental model: a hook, a bounded program, a map, and a user-space agent. If you can express your question that way, you can answer it in production without a reboot.
