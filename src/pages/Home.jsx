import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import HeroSection from "@/components/blog/HeroSection";
import BlogCard from "@/components/blog/BlogCard";
import { BLOG_POSTS } from "@/lib/blogData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/blog/PullToRefreshIndicator";

export default function Home() {
  const featuredPosts = BLOG_POSTS.filter((p) => p.featured);
  const latestPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  const onRefresh = useCallback(() => new Promise((res) => setTimeout(res, 800)), []);
  const { pulling, refreshing } = usePullToRefresh(onRefresh);

  return (
    <div>
      <PullToRefreshIndicator pulling={pulling} refreshing={refreshing} />
      <HeroSection />

      {/* Featured Posts */}
      <section id="posts" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground">Featured</h2>
            <p className="text-sm text-muted-foreground mt-1">Our top picks for you</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {featuredPosts.slice(0, 2).map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
        {featuredPosts.length > 2 && (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.slice(2).map((post, i) => (
              <BlogCard key={post.id} post={post} index={i + 2} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Posts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground">Latest Articles</h2>
            <p className="text-sm text-muted-foreground mt-1">Fresh insights and tutorials</p>
          </div>
          <Link to="/blog" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestPosts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h2 className="font-heading font-bold text-2xl mb-3">Stay Ahead of the Curve</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Get practical Web3, crypto, and Linux insights delivered through our blogs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://web3tech.site"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors touch-manipulation"
              >
                Visit The Web3 Tech Blog
              </a>
              <a
                href="https://techderksinsights.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
              >
                Visit TechDerks Insights
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-primary/40 text-primary font-medium text-sm hover:bg-primary/10 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}