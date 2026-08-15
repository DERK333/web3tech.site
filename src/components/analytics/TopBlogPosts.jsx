import React from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const categoryColors = {
  Blockchain: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  Linux: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Privacy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Software: "bg-green-500/10 text-green-400 border-green-500/20",
};

// Build a slug -> post map once for fast lookups
const POST_BY_SLUG = BLOG_POSTS.reduce((acc, p) => {
  acc[p.slug] = p;
  return acc;
}, {});

// Extract the slug from a GA4 page path like /blog/some-slug or /blog/some-slug?tag=x
function slugFromPath(path) {
  if (!path) return null;
  const clean = path.split("?")[0].split("#")[0];
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] !== "blog") return null;
  const slug = parts[1];
  return slug && slug.length > 0 ? slug : null;
}

export default function TopBlogPosts({ topPages, days }) {
  // Map GA page rows -> blog posts with view counts
  const postViews = new Map(); // slug -> { post, views }

  (topPages || []).forEach((row) => {
    const slug = slugFromPath(row.pagePath);
    if (!slug) return;
    const post = POST_BY_SLUG[slug];
    if (!post) return; // only show recognized blog posts
    const views = parseInt(row.screenPageViews, 10) || 0;
    const existing = postViews.get(slug);
    if (existing) existing.views += views;
    else postViews.set(slug, { post, views });
  });

  const ranked = [...postViews.values()].sort((a, b) => b.views - a.views).slice(0, 10);

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-heading font-semibold text-foreground">Top Blog Posts</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">by views · last {days} days</span>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No blog post views recorded in this period. Make sure your GA4 property is tracking <span className="font-mono text-xs">/blog/</span> paths.
        </p>
      ) : (
        <div className="space-y-1.5">
          {ranked.map((item, i) => {
            const { post, views } = item;
            const colorClass = categoryColors[post.category] || "bg-primary/10 text-primary border-primary/20";
            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/40 transition-colors"
                >
                  <span className="w-5 text-xs text-muted-foreground tabular-nums shrink-0">{i + 1}</span>
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    className="w-10 h-10 rounded-md object-cover shrink-0 border border-border/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorClass}`}>{post.category}</Badge>
                      <span className="text-[11px] text-muted-foreground truncate">/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-primary">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono tabular-nums">{views.toLocaleString()}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}