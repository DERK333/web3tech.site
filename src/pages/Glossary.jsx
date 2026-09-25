import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Search, X } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";
import { GLOSSARY_TERMS } from "@/lib/glossaryTerms";

export default function Glossary() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  // Group alphabetically; drop any term whose guide no longer exists so
  // links never 404 if the corpus changes. An active search keeps only
  // terms or definitions containing the typed text.
  const groups = useMemo(() => {
    const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
    const entries = GLOSSARY_TERMS
      .filter(
        (t) =>
          slugs.has(t.slug) &&
          (!normalizedQuery ||
            t.term.toLowerCase().includes(normalizedQuery) ||
            t.definition.toLowerCase().includes(normalizedQuery))
      )
      .sort((a, b) => a.term.localeCompare(b.term));
    const map = new Map();
    for (const entry of entries) {
      const letter = entry.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(entry);
    }
    return [...map.entries()];
  }, [normalizedQuery]);

  const matchCount = groups.reduce((sum, [, entries]) => sum + entries.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs font-semibold text-primary uppercase tracking-widest">Reference</p>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Web3 &amp; Linux Glossary
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Plain-English definitions of the Web3, blockchain, security, and Linux terms used across
          this site — each one linked to the full guide where it&apos;s covered in depth.
        </p>
      </div>

      {/* Live search across terms and definitions */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or definitions..."
            aria-label="Search glossary terms"
            className="w-full rounded-lg border border-border bg-card/70 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {normalizedQuery
            ? `${matchCount} matching ${matchCount === 1 ? "term" : "terms"}`
            : `${matchCount} terms`}
        </p>
      </div>

      <div className="space-y-8">
        {groups.map(([letter, entries]) => (
          <section key={letter}>
            <h2 className="font-heading text-lg font-bold text-primary mb-3">{letter}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry) => (
                <div key={entry.term} className="rounded-xl border border-border/60 bg-card/70 p-4">
                  <h3 className="font-heading font-semibold text-foreground mb-1.5">
                    {entry.term}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {entry.definition}
                  </p>
                  <Link
                    to={`/blog/${entry.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Read the full guide
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
        {normalizedQuery && groups.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-card/70 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No glossary terms match{" "}
              <span className="font-semibold text-foreground">&ldquo;{query.trim()}&rdquo;</span>.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}