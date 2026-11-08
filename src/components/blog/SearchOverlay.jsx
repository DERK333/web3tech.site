import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Clock, Tag, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOG_POSTS } from "@/lib/blogData";
import { Badge } from "@/components/ui/badge";

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length < 2 ? [] : BLOG_POSTS.filter((post) => {
    const q = query.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      (post.content || '').toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-full max-w-xl px-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts by title, tag, or content..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim().length < 2 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Type at least 2 characters to search...
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No posts found for "<span className="text-foreground">{query}</span>"
                  </div>
                ) : (
                  <ul className="py-2">
                    {results.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/blog/${post.slug}`}
                          onClick={onClose}
                          className="flex gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors group"
                        >
                          <img src={post.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-80 group-hover:opacity-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight mb-1 truncate">
                              {highlight(post.title, query)}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                              {highlight(post.excerpt, query)}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="text-[0.625rem] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 border">
                                {post.category}
                              </Badge>
                              {post.tags.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 2).map(t => (
                                <span key={t} className="flex items-center gap-0.5 text-[0.625rem] text-muted-foreground">
                                  <Tag className="w-2.5 h-2.5" />{t}
                                </span>
                              ))}
                              <span className="text-[0.625rem] text-muted-foreground ml-auto flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />{post.readTime}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border/50 flex items-center gap-3 text-[0.625rem] text-muted-foreground">
                <span><kbd className="px-1 py-0.5 bg-secondary rounded text-[0.625rem]">Esc</kbd> to close</span>
                <span><kbd className="px-1 py-0.5 bg-secondary rounded text-[0.625rem]">Enter</kbd> to open</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}