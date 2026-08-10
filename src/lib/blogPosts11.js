// Blog posts 11 — AI security / identity governance
export const BLOG_POSTS_11 = [
  {
    id: "delinea-ai-solutions-runtime-authorization-guide",
    slug: "delinea-ai-solutions-runtime-authorization-guide",
    title: "Delinea AI Solutions — Securing Autonomous Agents with Runtime Authorization",
    excerpt: "AI agents act autonomously, inherit broad access, and surface problems only after they act. Delinea enforces real-time, per-action authorization tied to a named identity — guardrails, not gates.",
    date: "2026-08-10",
    author: "Derrk Samuel",
    category: "Security",
    tags: ["AI", "Delinea", "Identity Security", "PAM", "Runtime Authorization", "MCP", "Zero Trust", "Machine Identity"],
    readTime: "7 min read",
    featured: true,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/541d47331_generated_image.png",
    content: `## Why AI Agents Break Traditional Access Models

An AI agent doesn't just respond — it **acts**. It queries databases, invokes APIs, executes shell commands, and chains tool calls together, often without a person reviewing each step. That autonomy is what separates an agent from a single-purpose AI tool, and it's exactly what makes the agent's access so hard to scope.

[Delinea's AI solutions](https://delinea.com/solutions/ai-solutions) are built around one thesis: the way we secure humans logging into systems does not work for agents that run on their own. The page frames the problem in four hard truths that every security team shipping AI is hitting right now.

---

## The Four Core Challenges

Delinea lists the challenges of securing AI identities plainly:

- **No consistent ownership or lifecycle governance** — agents get created and deployed, but no one owns their lifecycle. Stale agents linger with standing access.
- **Limited visibility into shadow AI** — security teams can't see which models agents are calling, what external tools they reach, or the dependency chains they pull in.
- **Rapid model and tool changes outpace manual reviews** — by the time a review finishes, the agent has already moved to a new model or a new endpoint.
- **Externally sourced datasets are susceptible to poisoning** — agents consume large, diverse datasets, many of them third-party, widening the attack surface.

These are not theoretical. They are the direct consequences of giving autonomous software the same broad access a human would get — then hoping nothing goes wrong.

---

## How Agents Differ From Human Sessions

| Property | Human session | AI agent |
|---|---|---|
| Who initiates each action | The person, every time | The agent, often unsupervised |
| Session length | Minutes to hours | Long-running, sometimes persistent |
| Credential handling | A person holds and enters it | Injected, ideally never seen by the agent |
| Review before action | Human judgement each step | Dozens of actions per session, no review |
| Accountability | A named user logs in | Often a shared or anonymous account |

When a problem surfaces, it surfaces **after** the agent has already acted. By then the damage is done — and because the account was shared or anonymous, there's often no clean answer to "who did this, and why?"

---

## Runtime Authorization — Guardrails, Not Gates

Delinea's core idea is to move policy enforcement to **where the agent is working**, not just the gate it enters through. The page describes it as five design principles:

### 1. Not just at the gate

Delinea sits *inside the connection itself*. Agents reach databases, SSH hosts, Kubernetes clusters, and cloud consoles directly — not only through an MCP server — and every one of those connections runs through Delinea.

### 2. Not treated like a human session

Delinea identifies whether a connection is agent-driven or human-driven **before** granting access, then applies agent-specific policy. Agents get the rules agents need; humans get theirs.

### 3. The agent never sees the credential

The credential is injected at the network layer, **just-in-time and scoped to the task**. When the task completes, the credential is revoked automatically. There is no standing secret for an attacker — or a compromised agent — to find.

### 4. Not authorized once and forgotten

Every tool call, query, and command inside a session is evaluated and authorized **individually, before it runs**. A single session can carry dozens of actions, each with its own risk level.

### 5. No shared or anonymous accounts

Every action ties to a specific identity — the person directing the agent or the dedicated service account it runs under. That creates a **defensible audit record**: when something goes wrong, there's an answer, not an excuse.

---

## Just-In-Time, Task-Scoped Credentials

The credential injection model is the part worth memorizing:

\`\`\`text
1. Agent requests access to a resource (DB, SSH host, cluster, console).
2. Delinea evaluates the request against agent-specific policy.
3. If approved, the credential is injected at the network layer — scoped to the single task.
4. The agent uses the resource without ever holding or seeing the credential.
5. When the task completes, the credential is revoked automatically.
\`\`\`

Because the agent never holds the credential, a compromised agent has nothing to steal. And because access is scoped to one task and revoked on completion, there is no standing privilege to abuse.

---

## The Numbers Delinea Cites

Delinea publishes three statistics that frame how unprepared most organizations are:

| Stat | Meaning |
|---|---|
| **44%** | Of organizations say their architecture is *fully equipped* to secure AI. Fewer than half. |
| **90%** | Of organizations place pressure on security teams to loosen access controls to support AI-driven automation. |
| **73%** | Of organizations agree that standing access for non-human identities and AI agents increases risk. |

The tension is clear: teams know standing access is dangerous (73%), but business pressure to ship AI pushes them to loosen controls anyway (90%) — while barely half (44%) believe their architecture is even ready.

---

## What Runtime Authorization Buys You

- **Nothing to steal** — the agent never holds a credential, so a compromised agent is a dead end for lateral movement.
- **Security isn't the bottleneck** — policy is enforced automatically and in real time, so AI deployment keeps moving instead of queueing behind manual reviews.
- **A defensible audit trail** — every action ties to a named identity and is recorded, so incidents have answers instead of excuses.
- **Proven at scale** — the same platform that governs privileged access across thousands of enterprises now governs the agents connecting to those systems.

---

## Delinea and the MCP Server

Delinea also ships a **Model Context Protocol (MCP) server** that lets AI agents reach protected systems through a secure, auditable path. Instead of bolting credentials into an agent's prompt or config, the MCP server brokers access — protecting secrets, enforcing identity, and logging every call.

This matters because MCP is fast becoming the standard way AI clients connect to external tools and data. Securing that path — rather than hoping each agent vendor does it correctly — is where runtime authorization and MCP converge.

---

## Guardrails, Not Gates

The underlying philosophy Delinea pushes across its AI content is simple: **guardrails, not gates**. Gates slow AI down and get bypassed under pressure. Guardrails let the agent move fast within a safe envelope — authorized per action, scoped per task, tied to a named identity, revoked when done.

For any team shipping autonomous agents against real production systems — databases, clusters, cloud consoles — that is the model worth adopting. The alternative is the status quo the numbers describe: agents with standing access, no owner, and an audit trail that can't answer "who did this?"

**Learn more:** [Delinea AI Solutions](https://delinea.com/solutions/ai-solutions) · [Runtime Authorization Whitepaper](https://delinea.com/resources/runtime-authorization-ai-agents) · [Delinea MCP Server](https://delinea.com/blog/unlocking-ai-agents-mcp)`
  },
];