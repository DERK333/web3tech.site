import React, { useState } from "react";
import { Copy, Check, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusStyles = {
  draft: "bg-primary/10 text-primary border-primary/20",
  posted: "bg-green-500/10 text-green-400 border-green-500/20",
  discarded: "bg-secondary text-secondary-foreground border-border",
};

export default function RedditDraftCard({ draft, onStatus }) {
  const [copied, setCopied] = useState(false);
  const isAnswer = draft.kind === "answer";
  // Answers get pasted as a reply — the question title stays on the thread.
  const fullText = [isAnswer ? "" : draft.title, draft.body, draft.link_line]
    .filter(Boolean)
    .join("\n\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLink = isAnswer && draft.question_url
    ? draft.question_url
    : `https://www.reddit.com/r/${draft.subreddit}/submit/`;
  const openLabel = isAnswer ? "Open thread" : `Open r/${draft.subreddit}`;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">
          {isAnswer ? "Answer" : "Insight"} · r/{draft.subreddit}
        </span>
        <Badge className={`border ${statusStyles[draft.status] || statusStyles.draft}`}>
          {draft.status}
        </Badge>
      </div>
      {isAnswer ? (
        <p className="text-xs text-muted-foreground italic leading-snug">{draft.title}</p>
      ) : (
        <h3 className="font-heading font-bold text-foreground leading-snug">{draft.title}</h3>
      )}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{draft.body}</p>
      {draft.link_line && <p className="text-xs text-primary break-words">{draft.link_line}</p>}
      <div className="flex gap-2 pt-1 flex-wrap">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : isAnswer ? "Copy reply" : "Copy post"}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={openLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            {openLabel}
          </a>
        </Button>
        {draft.status === "draft" && (
          <>
            <Button size="sm" variant="outline" onClick={() => onStatus(draft.id, "posted")}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark posted
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onStatus(draft.id, "discarded")}>
              <XCircle className="w-3.5 h-3.5" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}