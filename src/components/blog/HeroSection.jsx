import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://media.base44.com/images/public/6a112c3e2737801908a7c002/95d090739_generated_3e2dffc5.png"
          alt="Tech hero background"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Decorative glow — sized as a share of the section so it scales with the display */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] aspect-[3/2] bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-8">
            <Zap className="w-3 h-3" />
            Bold Insights on Crypto, Tech & Digital Innovation
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
            <span className="text-foreground">The</span>
            <span className="text-primary">Web3</span>
            <span className="text-foreground">Tech</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Practical guides, security tips, blockchain tools, and decentralized tech strategies. 
            From smart contract interactions to Linux hardening — 
            built for developers, by a developer.
          </p>

          <a
            href="#posts"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Explore Articles
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}