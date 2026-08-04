import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plug, Copy, Check, ExternalLink, Terminal, ShieldCheck, RefreshCw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

function CopyableUrl({ url }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard may be blocked in some contexts
    }
  };
  return (
    <div className="flex items-stretch gap-2">
      <code className="flex-1 min-w-0 truncate bg-secondary/60 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground">
        {url}
      </code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={copy}
        className="select-none shrink-0"
        aria-label="Copy server URL"
      >
        {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary text-xs font-semibold">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">{title}</p>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function Connect() {
  const serverUrl = useMemo(
    () => new URL("/api/mcp", window.location.origin).toString(),
    []
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Plug className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-foreground">Connect an AI assistant</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
        Point an AI client like Claude, ChatGPT, or Cursor at this app's MCP server. The assistant can then read posts, look up comments, and run reports — acting only as your signed-in account.
      </p>

      {/* Server URL card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">MCP server URL</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          This is the address your AI client connects to. Copy it and paste it where your client asks for a connector URL.
        </p>
        <CopyableUrl url={serverUrl} />
      </div>

      {/* Client tabs */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <Tabs defaultValue="claude">
          <TabsList className="grid grid-cols-4 w-full mb-5">
            <TabsTrigger value="claude" className="text-xs sm:text-sm">Claude</TabsTrigger>
            <TabsTrigger value="chatgpt" className="text-xs sm:text-sm">ChatGPT</TabsTrigger>
            <TabsTrigger value="cursor" className="text-xs sm:text-sm">Cursor</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom</TabsTrigger>
          </TabsList>

          {/* Claude */}
          <TabsContent value="claude" className="space-y-4 mt-2">
            <Step n={1} title="Open connector settings">
              From Claude's profile menu, open <span className="text-foreground font-medium">Settings</span> → <span className="text-foreground font-medium">Connectors</span>.
            </Step>
            <Step n={2} title="Add a custom connector">
              Click <span className="text-foreground font-medium">Add custom connector</span>, give it a name (e.g. "Web3 Insights Hub"), and paste the server URL above into the URL field.
            </Step>
            <Step n={3} title="Add and approve the connection">
              Click <span className="text-foreground font-medium">Add</span>. Claude will open this app's consent page — sign in with your app account and approve. The assistant only ever acts as you.
            </Step>
          </TabsContent>

          {/* ChatGPT */}
          <TabsContent value="chatgpt" className="space-y-4 mt-2">
            <Step n={1} title="Enable Developer mode">
              Open <span className="text-foreground font-medium">Apps</span> and enable Developer mode. Note the risk ChatGPT warns about — custom connectors run prompts against external data.
            </Step>
            <Step n={2} title="Create the app">
              Click <span className="text-foreground font-medium">Create app</span>, name it, and paste the server URL above as the connector URL. Click <span className="text-foreground font-medium">Create</span>.
            </Step>
            <Step n={3} title="Enable the app and approve">
              In the chat composer, enable your new app. ChatGPT will open this app's consent page — sign in with your app account and approve. The assistant only ever acts as you.
            </Step>
          </TabsContent>

          {/* Cursor */}
          <TabsContent value="cursor" className="space-y-4 mt-2">
            <Step n={1} title="Open Tools & Integrations">
              In Cursor, go to <span className="text-foreground font-medium">Settings</span> → <span className="text-foreground font-medium">Tools &amp; Integrations</span>.
            </Step>
            <Step n={2} title="Add a new MCP server">
              Click <span className="text-foreground font-medium">New MCP Server</span>. This opens <code className="font-mono text-xs text-foreground">mcp.json</code>. Add an entry whose <code className="font-mono text-xs text-foreground">url</code> is the server URL above, then save.
            </Step>
            <Step n={3} title="Toggle it on and approve">
              Enable the server toggle. Cursor will open this app's consent page — sign in with your app account and approve. The assistant only ever acts as you.
            </Step>
          </TabsContent>

          {/* Custom */}
          <TabsContent value="custom" className="space-y-4 mt-2">
            <Step n={1} title="Copy the server URL">
              Copy the MCP server URL above. Name + URL is all most streamable-HTTP MCP clients need.
            </Step>
            <Step n={2} title="Add it as a streamable HTTP server">
              In your client's MCP server settings, add a new <span className="text-foreground font-medium">streamable HTTP</span> server, give it a name, and paste the URL.
            </Step>
            <Step n={3} title="Reload and approve">
              Reload the client. It will open this app's consent page — sign in with your app account and approve. The assistant only ever acts as you.
            </Step>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-secondary/40 border border-border rounded-xl p-4">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Sign-in required.</span>{" "}
            Each client opens this app's consent page on first connect. You sign in with your own app account and approve — the assistant acts only as you, and only within your permissions.
          </p>
        </div>
        <div className="flex items-start gap-3 bg-secondary/40 border border-border rounded-xl p-4">
          <RefreshCw className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Refresh after changes.</span>{" "}
            Assistants cache the tool list. If we add or change tools, refresh the connector in your client so it picks up the latest list.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}