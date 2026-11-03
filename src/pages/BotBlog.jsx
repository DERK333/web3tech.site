import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BookOpen } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import { BLOG_POSTS } from "@/lib/blogData";

const LINKS = [
  { label: "Strategy guide", to: "/strategy-guide" },
  { label: "Market insights", to: "/market-insights" },
  { label: "Market bot", to: "/trading" },
];

export default function BotBlog() {
  const posts = useMemo(
    () =>
      BLOG_POSTS.filter((post) => post.category === "Trading").sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    []
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
        <Activity className="h-3.5 w-3.5" /> Bot journal
      </p>
      <h1 className="mt-2 font-heading text-3xl font-black text-foreground sm:text-4xl">
        Market notes
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Trading strategies, scan breakdowns and market analysis written from the bot's own rules —
        what it looks for, what it ignores, and why.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            {link.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-heading text-base font-semibold text-foreground">
              No market notes yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Posts filed under the Trading category appear here automatically.
            </p>
          </div>
        )}
      </div>

      <p className="mt-8 border-t border-border/60 pt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">
        Everything here describes a paper portfolio by default. Estimates are arithmetic, not
        forecasts, and nothing on this page is investment advice.
      </p>
    </div>
  );
}