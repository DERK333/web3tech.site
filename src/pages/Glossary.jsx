import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";
import { GLOSSARY_TERMS } from "@/lib/glossaryTerms";

export default function Glossary() {
  // Group alphabetically; drop any term whose guide no longer exists so
  // links never 404 if the corpus changes.
  const groups = useMemo(() => {
    const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
    const entries = GLOSSARY_TERMS
      .filter((t) => slugs.has(t.slug))
      .sort((a, b) => a.term.localeCompare(b.term));
    const map = new Map();
    for (const entry of entries) {
      const letter = entry.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(entry);
    }
    return [...map.entries()];
  }, []);

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
      </div>
    </div>
  );
}