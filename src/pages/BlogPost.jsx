import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BLOG_POSTS, AUTHOR } from "@/lib/blogData";
import CommentSection from "@/components/blog/CommentSection";
import ShareButtons from "@/components/blog/ShareButtons";
import RelatedArticles from "@/components/blog/RelatedArticles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const categoryColors = {
  Blockchain: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Security: "bg-red-500/10 text-red-400 border-red-500/20",
  Linux: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Privacy: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Software: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

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

      {/* Hero Image */}
      <div className="relative w-full h-52 sm:h-64 md:h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 md:-mt-24 relative z-10 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post.category}</span>
        </nav>

        {/* Category + Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={`border ${colorClass}`}>{post.category}</Badge>
          {post.tags.slice(0, 4).map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
              <Badge variant="outline" className="text-xs text-muted-foreground hover:border-primary/40 hover:text-primary cursor-pointer transition-colors">
                <Tag className="w-3 h-3 mr-1" />{tag}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4"
        >
          {post.title}
        </motion.h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
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

        {/* Excerpt pull-quote */}
        <blockquote className="border-l-4 border-primary pl-4 py-1 mb-8 text-muted-foreground italic text-base">
          {post.excerpt}
        </blockquote>

        {/* Content */}
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </motion.div>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-border">
          <ShareButtons post={post} />
        </div>

        {/* Author card */}
        <div className="mt-8 p-5 rounded-xl border border-border bg-card flex gap-4 items-start">
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

        {/* Related Articles */}
        <RelatedArticles currentPost={post} />

        {/* Comments */}
        <div className="mt-10">
          <CommentSection postSlug={post.slug} />
        </div>
      </div>
    </div>
  );
}