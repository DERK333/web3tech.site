import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STATUS = {
  pending: { icon: Loader2, label: "Pending", spin: true, color: "text-muted-foreground" },
  running: { icon: Loader2, label: "Running", spin: true, color: "text-muted-foreground" },
  in_progress: { icon: Loader2, label: "Working", spin: true, color: "text-primary" },
  completed: { icon: CheckCircle2, label: "Done", spin: false, color: "text-primary" },
  success: { icon: CheckCircle2, label: "Done", spin: false, color: "text-primary" },
  failed: { icon: XCircle, label: "Failed", spin: false, color: "text-destructive" },
  error: { icon: XCircle, label: "Error", spin: false, color: "text-destructive" },
};

function ToolDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS[toolCall.status] || STATUS.pending;
  const Icon = status.icon;
  const failed = ["failed", "error"].includes(toolCall.status);
  const dp = toolCall.display_projection || {};
  const hide = dp.hide_details && dp.details_redacted;
  const label = failed
    ? (dp.error_label || status.label)
    : (["pending", "running", "in_progress"].includes(toolCall.status) ? (dp.active_label || status.label) : (dp.label || status.label));

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch { /* keep raw */ }
  let parsedResults = toolCall.results;
  try { if (typeof parsedResults === "string") parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ }

  const isFailed = failed || (parsedResults && typeof parsedResults === "object" && parsedResults.success === false) || /error|failed/i.test(typeof parsedResults === "string" ? parsedResults : "");

  return (
    <div className="mt-2 text-xs border border-border/50 rounded-lg bg-secondary/40 overflow-hidden">
      <button
        type="button"
        onClick={() => !hide && setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/60 transition-colors"
      >
        {!hide && (expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
        <Icon className={`w-3.5 h-3.5 ${status.spin ? "animate-spin" : ""} ${isFailed ? "text-destructive" : status.color}`} />
        <span className="font-mono text-muted-foreground">{toolCall.name}</span>
        <span className={isFailed ? "text-destructive" : "text-muted-foreground"}>· {label}</span>
      </button>
      {expanded && !hide && (
        <div className="px-3 py-2 space-y-2 border-t border-border/50">
          {toolCall.arguments_string && (
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Parameters</div>
              <pre className="font-mono text-[10px] text-foreground/80 whitespace-pre-wrap break-all">{typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}</pre>
            </div>
          )}
          {parsedResults !== undefined && parsedResults !== null && (
            <div>
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Result</div>
              <pre className="font-mono text-[10px] text-foreground/80 whitespace-pre-wrap break-all">{typeof parsedResults === "object" ? JSON.stringify(parsedResults, null, 2) : String(parsedResults)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"}`}>
        {message.content && (isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {message.tool_calls?.map((tc, i) => <ToolDisplay key={i} toolCall={tc} />)}
      </div>
    </motion.div>
  );
}