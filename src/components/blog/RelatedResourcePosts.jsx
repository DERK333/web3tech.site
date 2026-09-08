import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS } from "@/lib/blogData";

const categoryColors = {
  Blockchain: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  Linux: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Privacy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Software: "bg-green-500/10 text-green-400 border-green-500/20",
};

// Related tutorials for a resource — matched by tags from the blog post metadata
export default function RelatedResourcePosts({ resource }) {
  const related = BLOG_POSTS.filter((p) => (p.tags || []).some((t) => resource.tags?.includes(t))).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <h2 className="font-heading font-bold text-xl text-foreground mb-5">Related Tutorials</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map((post) => {
          const colorClass = categoryColors[post.category] || "bg-primary/10 text-primary border-primary/20";
          return (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <Badge className={`absolute top-2 left-2 border text-[10px] ${colorClass}`}>{post.category}</Badge>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">{format(new Date(post.date), "MMM d, yyyy")}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}