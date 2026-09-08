import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";
import { CATEGORY_META, findCategoryBySlug } from "@/lib/categoryMeta";
import BlogCard from "@/components/blog/BlogCard";
import NewsletterWidget from "@/components/blog/NewsletterWidget";

export default function CategoryDetail() {
  const { slug } = useParams();
  const match = findCategoryBySlug(slug);
  const categoryName = match?.[0];
  const meta = match?.[1];
  const Icon = meta?.icon;
  const posts = match ? BLOG_POSTS.filter((p) => p.category === categoryName) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Unique meta title + description per category (same pattern as BlogPost)
  useEffect(() => {
    if (!meta) return;
    document.title = meta.metaTitle;
    const desc = document.querySelector("meta[name='description']");
    if (desc) desc.setAttribute("content", meta.metaDesc);
  }, [meta]);

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Category not found</h1>
        <p className="text-sm text-muted-foreground">This category doesn't exist in our library.</p>
        <Link to="/categories" className="text-primary hover:underline flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-foreground">{categoryName}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground leading-tight">
              {categoryName} Tutorials
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {posts.length} {posts.length === 1 ? "article" : "articles"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-2xl">{meta.desc}</p>

        {/* Posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {posts.map((post, i) => (
            <BlogCard key={post.slug} post={post} index={i} />
          ))}
        </div>

        {/* Newsletter */}
        <NewsletterWidget />
      </motion.div>
    </div>
  );
}