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
];