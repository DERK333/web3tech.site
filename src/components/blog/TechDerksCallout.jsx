import React from "react";
import { ExternalLink, Sparkles } from "lucide-react";

const TECHDERKS_HOME = "https://techderksinsights.blogspot.com";

/**
 * Small end-of-post callout surfacing the author's second blog,
 * shown on Blockchain and Security posts.
 */
export default function TechDerksCallout() {
  return (
    <div className="mt-8 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-heading font-semibold text-sm text-foreground">
          Also featured on TechDerks Insights
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          I write more takes like this one on my second blog — blockchain deep dives,
          security breakdowns, and builder tools.
        </p>
        <a
          href={TECHDERKS_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
        >
          Read more on TechDerks Insights
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}