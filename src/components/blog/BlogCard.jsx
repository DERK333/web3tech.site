import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

const categoryColors = {
  Trading: "bg-primary/10 text-primary border-primary/20",
  Blockchain: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Security: "bg-destructive/10 text-destructive border-destructive/20",
  Linux: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Privacy: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Software: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

export default function BlogCard({ post, index = 0, variant = "default", onTagClick }) {
  const isHero = variant === "hero";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 5) * 0.06 }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className={`group block rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/30 hover:bg-card transition-all duration-300 ${
          isHero ? "md:grid md:grid-cols-2" : ""
        }`}
      >
        {/* Image — the aspect ratio scales with the card width, no fixed height */}
        <div className={`relative overflow-hidden aspect-[16/10] ${isHero ? "md:aspect-auto md:h-full" : ""}`}>
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <Badge className={`absolute top-3 left-3 ${categoryColors[post.category] || "bg-secondary text-secondary-foreground"} border text-xs`}>
            {post.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.date), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h3 className={`font-heading font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight ${
            isHero ? "text-xl md:text-2xl" : "text-base"
          }`}>
            {post.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3" onClick={(e) => e.preventDefault()}>
              {post.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="text-[0.625rem] px-2 py-0.5 rounded-full border border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read Article <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}