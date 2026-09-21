import React from "react";
import { ExternalLink, PenLine } from "lucide-react";

// TechDerks Insights — the author's second blog (Blogger).
const TECHDERKS_HOME = "https://techderksinsights.blogspot.com";

// Recent posts, hardcoded for now (URLs verified against the live blog).
const TECHDERKS_POSTS = [
  {
    title: "The Ultimate Guide to Launching Digital Products",
    url: "https://techderksinsights.blogspot.com/2026/06/the-ultimate-guide-to-launching-digital.html",
  },
  {
    title: "Benefits of Google's Advanced Protection Program",
    url: "https://techderksinsights.blogspot.com/2025/08/benefits-of-googles-advanced-protection.html",
  },
  {
    title: "Extracting Data from Smart Contracts with Containers",
    url: "https://techderksinsights.blogspot.com/2025/06/extract-data-from-contract.html",
  },
];

/**
 * "Also published on TechDerks Insights" cross-link section.
 * compact=true renders a tight list for the footer column.
 */
export default function TechDerksSection({ compact = false }) {
  const links = TECHDERKS_POSTS.map((post) => (
    <a
      key={post.url}
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          : "flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      }
    >
      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
      {post.title}
    </a>
  ));

  if (compact) {
    return (
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs font-heading font-semibold text-foreground uppercase tracking-wider mb-3">
          Also published on TechDerks Insights
        </p>
        <div className="space-y-2">{links}</div>
        <a
          href={TECHDERKS_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
        >
          <PenLine className="w-3 h-3" />
          Visit TechDerks Insights
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-3">
        <PenLine className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-lg">Also published on TechDerks Insights</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        Selected writing from my second blog — cross-posted takes and companion reads on
        blockchain, security, and digital products.
      </p>
      <div className="space-y-3">{links}</div>
      <a
        href={TECHDERKS_HOME}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Visit TechDerks Insights
      </a>
    </div>
  );
}