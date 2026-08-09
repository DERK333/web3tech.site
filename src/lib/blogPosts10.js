// Blog posts 10 — AI / automation / productivity guides
export const BLOG_POSTS_10 = [
  {
    id: "prompt-ai-agent-extract-format-code-commands",
    slug: "prompt-ai-agent-extract-format-code-commands",
    title: "How to Prompt an AI Agent to Extract and Format Code Commands From Blog Posts",
    excerpt: "Turn a messy post into clean, copyable terminal blocks. The exact prompt to make an AI agent scan a blog post, pull every command, and wrap each one in its own language-tagged code block with a Copy button — in execution order.",
    date: "2026-08-09",
    author: "Derrk Samuel",
    category: "Software",
    tags: ["AI", "Automation", "Markdown", "Prompts", "Code Snippets", "Productivity", "Workflow"],
    readTime: "5 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/2d3760c67_generated_image.png",
    content: `## Why Command Formatting Matters

When a blog post mixes prose with terminal commands, raw inline text like \`sudo apt update && sudo apt install git\` is hard to copy and easy to mistype. Wrapping each command in its own Markdown code block with a language tag (\`bash\`, \`sh\`, \`powershell\`) gives readers a dark terminal-style box with a one-click **Copy** button — and keeps multi-step instructions in execution order.

If your AI agent scans a post and dumps everything into one giant block, readers can't run steps individually. The fix is a strict prompt that forces **one command per block, in order, with the right language tag.**

---

## The Exact Prompt

Copy and paste this into your AI agent's system instructions or chat:

\`\`\`text
Please scan the provided blog post and, for every terminal, shell, or code
command you find, create a code block with the command inside it. Place each
code block in the blog post at the exact point where you extracted the command,
so the reader can follow the steps in order.

Rules:
1. Format every single command inside its own standalone Markdown code block.
2. Specify the appropriate language or shell right after the opening triple
   backticks — for example bash, sh, or powershell.
3. Do not bundle multiple distinct steps into one block. Each step gets its own
   block, in the order they appear in the post.
4. Leave surrounding explanatory text intact; only wrap the commands.
5. Remove duplicate commands unless a step explicitly repeats them.
\`\`\`

---

## How the Formatting Maps to the UI

| Markdown element | What it produces |
|------------------|------------------|
| \`\`\`bash … \`\`\` | Dark terminal box with a Copy button |
| \`\`\`powershell … \`\`\` | Windows-style command block |
| \`\`\`text … \`\`\` | Plain preformatted text (no syntax highlight) |
| \\\`inline code\\\` | Highlighted inline snippet within a sentence |

The triple backticks are the universal Markdown signal for a code block. The language tag immediately after the opening backticks tells the renderer which shell to style — and triggers the **Copy** button on most modern interfaces.

---

## One Command Per Block — The Isolation Rule

Bundling an entire script into one block looks tidy but breaks step-by-step execution. Instead of this:

\`\`\`bash
sudo apt update && sudo apt install git && git clone https://example.com/repo.git
\`\`\`

Prefer this:

\`\`\`bash
sudo apt update
\`\`\`

\`\`\`bash
sudo apt install git
\`\`\`

\`\`\`bash
git clone https://example.com/repo.git
\`\`\`

Each block becomes a separate Copy target, so the reader runs and verifies one step before moving to the next.

---

## Where Code Snippets Come From (Background)

Code snippets — reusable template blocks — exist in many editors before you ever involve an AI agent:

### Visual Studio Code
Use built-in IntelliSense or the **Snippets** menu to insert templates for loops, conditionals, and boilerplate. Configure user snippets from **Command Palette → Preferences: Configure User Snippets**.

### Visual Studio
Add expansion or surround-with blocks using shortcut keys like \`Ctrl+K, X\`. Snippets are managed under **Tools → Code Snippets Manager**.

### WordPress
Use the **Code Snippets** plugin (or alternatives like WPCodeBox and Fluent Snippets) to safely add PHP, CSS, or JS without editing core theme files.

> Tip: The same "isolate each command" discipline applies when you author snippets by hand — one responsibility per block keeps them reusable.

---

## Putting It Together

Give your agent the prompt above, point it at an unformatted post, and it returns the content with every command lifted into its own tagged, copyable block — in order — and the surrounding prose left readable. Run it once per post, or bake the instructions into the agent's system prompt so every draft comes back formatted automatically.`
  },
  {
    id: "write-instructions-for-ai-model-formatting",
    slug: "write-instructions-for-ai-model-formatting",
    title: "How to Write Instructions for an AI Model — and Where to Add Them",
    excerpt: "System instructions shape every conversation an AI model has with you. Here's how to format them so the agent actually follows them, plus exactly where to add them in Google Gemini, Base44 agents, and Microsoft Copilot 365.",
    date: "2026-08-09",
    author: "Derrk Samuel",
    category: "Software",
    tags: ["AI", "Instructions", "Prompts", "Gemini", "Base44", "Copilot", "Productivity"],
    readTime: "6 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/7af7997f0_generated_image.png",
    content: `## What AI Instructions Actually Are

System instructions (also called a **system prompt** or **custom instructions**) are the standing rules an AI model applies to every conversation. Unlike a normal message you type once, instructions sit behind the scenes and shape tone, format, role, and boundaries — so you don't have to repeat yourself in every chat.

Think of them as a job description: the clearer and more structured they are, the more reliably the model follows them.

---

## How to Format Instructions So the Model Understands

Models follow structure better than prose. Five principles:

### 1. Assign a clear role
Tell the model what it is and who it's helping.

\`\`\`text
You are a senior technical editor for a Web3 blog. You write in plain
language for intermediate developers.
\`\`\`

### 2. Say what to do, not what to avoid
Positive framing is easier to follow than negation.

\`\`\`text
Prefer concrete code examples over abstract descriptions.
\`\`\`

### 3. Define the output format
Be explicit about structure so results are consistent.

\`\`\`text
Return each terminal command in its own fenced code block tagged with
bash, sh, or powershell. Never bundle two commands in one block.
\`\`\`

### 4. Give examples (few-shot)
One example communicates more than five rules.

\`\`\`text
Example:
Input:  "run apt update then install git"
Output: two separate fenced bash blocks — first "sudo apt update",
        then "sudo apt install git".
\`\`\`

### 5. Keep it stable and ordered
Put the most important rules first — models weight early instructions more heavily.

---

## Element Cheatsheet

| Section | Purpose | Example |
|---------|---------|---------|
| Role | Identity & expertise | "You are a senior Linux sysadmin." |
| Audience | Tone & reading level | "Write for intermediate developers." |
| Format | Output structure | "One command per fenced block." |
| Rules | Hard boundaries | "Never invent package names." |
| Examples | Show, don't tell | A worked input → output pair |

---

## A Template You Can Reuse

\`\`\`text
ROLE: You are a {role} for {audience}.

GOAL: {what a successful response looks like}

RULES:
1. {rule one}
2. {rule two}
3. {rule three}

FORMAT: {exact output structure}

EXAMPLES:
Input: {sample input}
Output: {sample output}

If you cannot fulfill the request, say so plainly instead of guessing.
\`\`\`

> Tip: Save this template and fill in the braces per project. A stable template across all your agents makes their behavior predictable.

---

## Where to Add Instructions — By Platform

Each platform hides the instructions panel in a different spot. Here's how to reach it in the three most common ones.

### Google Gemini (gemini.google.com)
1. Open [gemini.google.com](https://gemini.google.com/) on your computer.
2. At the bottom, click **Settings & help**.
3. Go to **Personal Intelligence → Instructions for Gemini**.
4. Click **Add +**.
5. Enter your instructions, then click **Submit**.
6. Toggle the instructions on or off from the same panel anytime.

### Base44 Agents
In a Base44 app, instructions live in the agent's config file:

1. Open your app's builder.
2. Navigate to **base44/agents/** and open (or create) an agent JSON config file.
3. Set the \`instructions\` field — it is the system prompt that defines behavior, personality, and guidelines.
4. Add \`tool_configs\` to grant the agent entity or backend-function access.
5. Save — the agent picks up the new instructions on its next run.

A minimal example:

\`\`\`json
{
  "name": "insights_assistant",
  "description": "Helps visitors with blog content and signups",
  "instructions": "You are a friendly assistant for TheWeb3Tech blog... (your rules here)",
  "model": "anthropic/claude-sonnet-4-20250514",
  "tool_configs": []
}
\`\`\`

### Microsoft Copilot 365
1. Go to [microsoft365.com/chat](https://www.microsoft365.com/chat) and sign in.
2. In the top-right, open **Settings**.
3. Select **Custom instructions** (rolling out across tenants — if you don't see it yet, check again in a few days).
4. Enter your standing instructions and save.
5. For per-notebook control, open a **Copilot Notebook**, then click the expand arrow next to its name in the left pane and add instructions for that notebook only.

---

## Platform Quick Reference

| Platform | Where instructions live | Scope |
|----------|--------------------------|-------|
| Google Gemini | Settings & help → Personal Intelligence → Instructions for Gemini | Every chat |
| Base44 agents | base44/agents/<name>.jsonc → \`instructions\` field | That agent only |
| Microsoft Copilot 365 | microsoft365.com/chat → Settings → Custom instructions | Your Copilot chats |

---

## Final Checks Before You Save

- Read your instructions out loud — if a new teammate couldn't follow them, neither can the model.
- Test with three different prompts and check whether the output format stays consistent.
- Trim anything redundant; long instructions dilute the important rules.
- Revisit monthly — platforms update their models, and what worked in June may drift by August.

Good instructions are a one-time investment that pays off in every conversation afterward.`
  },
];