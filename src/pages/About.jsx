import React from "react";
import { ExternalLink, Shield, Code, Cpu, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { AUTHOR, BLOG_POSTS, CATEGORIES } from "@/lib/blogData";
import TechDerksSection from "@/components/blog/TechDerksSection";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-4">About TheWeb3Tech</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {AUTHOR.bio}
          </p>
        </div>

        {/* Author */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8 mb-8">
          <h2 className="font-heading font-bold text-lg mb-4">Written by {AUTHOR.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            A passionate technologist focused on Web3, blockchain development, Linux systems, 
            and cybersecurity. Through practical guides and real-world tutorials, the goal is 
            to make complex tech accessible to developers and tech enthusiasts worldwide.
          </p>
          <div className="flex flex-wrap gap-3">
            {AUTHOR.blogs.map((blog) => (
              <a
                key={blog.url}
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {blog.name}
              </a>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Code, title: "Blockchain & Web3", desc: "Smart contracts, Ethereum interactions, data extraction, and decentralized architectures." },
            { icon: Shield, title: "Cybersecurity", desc: "Google Advanced Protection, TailsOS, phishing defense, and operational security guides." },
            { icon: Cpu, title: "Linux & DevOps", desc: "Docker troubleshooting, system tools, bootable OS guides, and server management." },
            { icon: Terminal, title: "Software & Tools", desc: "Trusted download sources, Windows utilities, security scanners, and developer productivity tools." },
          ].map((topic) => (
            <div key={topic.title} className="rounded-xl border border-border/50 bg-card/50 p-5">
              <topic.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-heading font-semibold text-sm mb-1">{topic.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl border border-border/50 bg-card/50">
            <p className="font-heading font-bold text-2xl text-primary">{BLOG_POSTS.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Articles</p>
          </div>
          <div className="text-center p-4 rounded-xl border border-border/50 bg-card/50">
            <p className="font-heading font-bold text-2xl text-primary">{CATEGORIES.length - 1}</p>
            <p className="text-xs text-muted-foreground mt-1">Categories</p>
          </div>
          <div className="text-center p-4 rounded-xl border border-border/50 bg-card/50">
            <p className="font-heading font-bold text-2xl text-primary">2</p>
            <p className="text-xs text-muted-foreground mt-1">Blog Sources</p>
          </div>
        </div>

        {/* Also published on TechDerks Insights */}
        <div className="mt-8">
          <TechDerksSection />
        </div>
      </motion.div>
    </div>
  );
}