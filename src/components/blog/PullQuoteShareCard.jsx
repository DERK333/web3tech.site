import React from "react";
import { Twitter } from "lucide-react";

// Recursively extracts the plain text from rendered React children
export function extractText(children) {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (React.isValidElement(child)) return extractText(child.props.children);
      return "";
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// Styled pull-quote card rendered below each blockquote in a post,
// matching the ShareButtons color scheme.
export default function PullQuoteShareCard({ quote, post }) {
  const url = post?.slug
    ? `${window.location.origin}/blog/${post.slug}`
    : window.location.href;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quote}" ${url}`)}`;

  return (
    <div className="my-5 rounded-xl border border-border/50 bg-card/50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <p className="text-sm italic text-foreground leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share this quote on X"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground text-xs font-medium transition-all duration-200 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 shrink-0 self-start sm:self-center"
      >
        <Twitter className="w-3.5 h-3.5" />
        Share on X
      </a>
    </div>
  );
}