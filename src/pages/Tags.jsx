import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";

export default function Tags() {
  const tagData = useMemo(() => {
    const counts = {};
    BLOG_POSTS.forEach((post) => {
      post.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    const max = Math.max(...Object.values(counts));
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return { entries, max };
  }, []);

  const getSize = (count) => {
    const ratio = count / tagData.max;
    return 0.8 + ratio * 0.7;
  };

  const getColor = (count) => {
    const ratio = count / tagData.max;
    if (ratio > 0.75) return "border-primary bg-primary/15 text-primary";
    if (ratio > 0.4) return "border-accent/50 bg-accent/10 text-accent";
    return "border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <Hash className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">All Tags</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover content by interest area. {tagData.entries.length} tags across {BLOG_POSTS.length} articles. Click any tag to filter the blog.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {tagData.entries.map(([tag, count]) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                style={{ fontSize: `${getSize(count)}rem` }}
                className={`px-3.5 py-1.5 rounded-full border font-medium transition-all hover:scale-105 min-h-[36px] flex items-center ${getColor(count)}`}
                title={`${count} article${count > 1 ? "s" : ""}`}
              >
                #{tag}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}