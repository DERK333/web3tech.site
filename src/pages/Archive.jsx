import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Archive() {
  const grouped = useMemo(() => {
    const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
    const map = new Map();
    sorted.forEach((post) => {
      const d = new Date(post.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, { year: d.getFullYear(), month: d.getMonth(), posts: [] });
      map.get(key).posts.push(post);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3 text-center">Archive</h1>
          <p className="text-muted-foreground text-center max-w-lg mx-auto">
            {BLOG_POSTS.length} articles organized chronologically by month and year.
          </p>
        </div>

        <div className="space-y-8">
          {grouped.map(([, group], gi) => (
            <motion.div
              key={`${group.year}-${group.month}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-heading font-bold text-lg text-foreground">
                  {MONTHS[group.month]} {group.year}
                </h2>
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/60">
                  {group.posts.length}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div className="space-y-2.5">
                {group.posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/40 transition-colors group"
                  >
                    <span className="text-xs text-muted-foreground font-mono flex-shrink-0 mt-0.5 w-10">
                      {new Date(post.date).toLocaleDateString("en-US", { day: "2-digit" })}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{post.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}