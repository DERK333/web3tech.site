import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, AUTHOR } from "@/lib/blogData";
import { applyInternalLinks } from "@/lib/internalLinks";
import ShareSignupForm from "@/components/blog/ShareSignupForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const categoryColors = {
  Blockchain: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  Linux: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Privacy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Software: "bg-green-500/10 text-green-400 border-green-500/20",
};

// Conversion-optimized share landing page: /share/:slug
// Title + excerpt hero, full-width newsletter signup, author card, article body.
// Auto-scrolls to the signup form after 5 seconds (unless the visitor is
// already reading).
export default function ShareLanding() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — TheWeb3Tech`;
      const desc = document.querySelector("meta[name='description']");
      if (desc) desc.setAttribute("content", post.excerpt);
    }
  }, [post]);

  // Gentle nudge: scroll to the signup form after 5 seconds —
  // skipped if the visitor has already scrolled into the article.
  useEffect(() => {
    if (!post) return;
    const timer = setTimeout(() => {
      if (window.scrollY < 150 && formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const colorClass = categoryColors[post.category] || "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author },
            keywords: post.tags.join(", "),
            articleSection: post.category,
          }),
        }}
      />

      {/* Hero: title, excerpt, meta */}
      <header className="relative w-full overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Read on the blog
          </Link>
          <Badge className={`border ${colorClass} mb-4`}>{post.category}</Badge>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4"
          >
            {post.title}
          </motion.h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />{post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />{post.readTime}
            </span>
          </div>
        </div>
      </header>

      {/* Full-width newsletter signup above the article body */}
      <div ref={formRef} className="scroll-mt-16">
        <ShareSignupForm />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-20">
        {/* Author card */}
        <div className="mb-10 p-5 rounded-xl border border-border bg-card flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
            {AUTHOR.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-foreground">{AUTHOR.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{AUTHOR.bio}</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              {AUTHOR.blogs.map((b) => (
                <a key={b.url} href={b.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline">
                  {b.name} →
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className="prose prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
            prose-h3:text-lg prose-h3:text-primary prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:bg-secondary prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-blockquote:bg-secondary/40 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
            prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
            prose-strong:text-foreground
            prose-li:text-muted-foreground"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {applyInternalLinks(post.content, post.slug)}
          </ReactMarkdown>
        </motion.div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <Link to="/blog" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Browse all articles
          </Link>
        </div>
      </div>
    </div>
  );
}