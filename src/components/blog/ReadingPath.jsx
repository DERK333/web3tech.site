import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

// One curated reading path — a numbered list of posts, in read order
export default function ReadingPath({ icon: Icon, title, description, posts, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-border/50 bg-card/50 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg text-foreground leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <ol className="space-y-2">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-background/40 hover:border-primary/30 hover:bg-secondary/40 transition-all"
            >
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {post.title}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />{post.readTime}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Path {index + 1} of 4</p>
    </motion.section>
  );
}