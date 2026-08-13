import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "@/lib/blogData";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return BLOG_POSTS.filter((post) => {
      const haystack = [
        post.title,
        post.excerpt,
        post.content,
        post.category,
        ...(post.tags || []),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [query]);

  const updateQuery = (value) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Search the Archive</h1>
          <p className="text-muted-foreground">
            Find articles by keyword, tag, or topic across our entire blog library.
          </p>
        </div>

        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            placeholder="Search articles..."
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-card border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
          {query && (
            <button
              onClick={() => updateQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {query.trim() === "" ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Start typing to search {BLOG_POSTS.length} articles.
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm mb-2">No results for "{query}"</p>
            <p className="text-xs text-muted-foreground">Try a different keyword or browse all articles.</p>
            <Link to="/blog" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Browse all articles →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
            </p>
            <div className="space-y-3">
              {results.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block rounded-xl border border-border/50 bg-card/50 p-5 hover:border-primary/40 hover:bg-card transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h2 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1">{post.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}