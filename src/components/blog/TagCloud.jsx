import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";

export default function TagCloud({ activeTag, onTagClick }) {
  const [expanded, setExpanded] = useState(false);

  const tagCounts = {};
  BLOG_POSTS.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const maxCount = Math.max(...Object.values(tagCounts));
  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const visibleTags = expanded ? tags : tags.slice(0, 12);

  const getSize = (count) => {
    const ratio = count / maxCount;
    return 0.7 + ratio * 0.4;
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="font-heading font-bold text-sm text-foreground">Popular Tags</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">
          {expanded ? "Show less" : `Show all (${tags.length})`}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      <div className="flex flex-wrap gap-2">
        {activeTag && (
          <button
            onClick={() => onTagClick(null)}
            className="text-xs px-2.5 py-1 rounded-full border border-primary/50 bg-primary/10 text-primary font-medium min-h-9 flex items-center"
          >
            ✕ Clear
          </button>
        )}
        {visibleTags.map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag === activeTag ? null : tag)}
            title={`${count} article${count > 1 ? "s" : ""}`}
            style={{ fontSize: `${getSize(count)}rem` }}
            className={`px-2.5 py-1 rounded-full border transition-all min-h-9 flex items-center ${
              tag === activeTag
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}