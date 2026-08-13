import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Shield, Terminal, Eye, Box, ArrowRight } from "lucide-react";
import { BLOG_POSTS, CATEGORIES } from "@/lib/blogData";

const CATEGORY_META = {
  Blockchain: { icon: Box, desc: "Smart contracts, Ethereum, Kaspa, Monero, node setups, and Docker-based blockchain tooling." },
  Security: { icon: Shield, desc: "TailsOS, phishing defense, Google Advanced Protection, hardening, and operational security." },
  Linux: { icon: Terminal, desc: "Ubuntu, Debian, Docker, system administration, partitioning, and server management." },
  Privacy: { icon: Eye, desc: "Tor, Tails, anonymous browsing, and tools for protecting your digital footprint." },
  Software: { icon: Code, desc: "Trusted download sources, Windows utilities, developer tools, and productivity apps." },
};

export default function Categories() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Categories</h1>
          <p className="text-muted-foreground max-w-lg">
            Browse our content library by topic. Each category groups practical guides and tutorials to help you find what you need fast.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {CATEGORIES.filter((c) => c.name !== "All").map((cat, i) => {
            const meta = CATEGORY_META[cat.name] || { icon: Code, desc: "" };
            const Icon = meta.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/blog?category=${encodeURIComponent(cat.name)}`}
                  className="block h-full rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/40 hover:bg-card transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full bg-secondary/60">
                      {cat.count} {cat.count === 1 ? "article" : "articles"}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-lg mb-2 group-hover:text-primary transition-colors">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{meta.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                    Browse {cat.name} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}