import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import TagCloud from "@/components/blog/TagCloud";
import NewsletterWidget from "@/components/blog/NewsletterWidget";
import { BLOG_POSTS, CATEGORIES } from "@/lib/blogData";
import { motion } from "framer-motion";
import MobileDrawerSelect from "@/components/ui/MobileDrawerSelect";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/blog/PullToRefreshIndicator";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the active tag reflected in the URL so tag links are shareable.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeTag) next.set("tag", activeTag);
    else next.delete("tag");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  const onRefresh = useCallback(() => new Promise((res) => setTimeout(res, 800)), []);
  const { pulling, refreshing } = usePullToRefresh(onRefresh);

  const filteredPosts = useMemo(() => {
    let posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activeCategory !== "All") {
      posts = posts.filter((p) => p.category === activeCategory);
    }

    if (activeTag) {
      posts = posts.filter((p) => p.tags?.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [activeCategory, searchQuery, activeTag]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <PullToRefreshIndicator pulling={pulling} refreshing={refreshing} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground">
          All articles on Web3, blockchain, cybersecurity, Linux, and software tools.
        </p>
      </motion.div>

      {/* Sticky search + filters bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pb-4 pt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border/40 mb-8">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search articles by title, tag, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-11 text-base bg-secondary border-border rounded-xl focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile filter drawer trigger */}
          <MobileDrawerSelect
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title="Filter by Category"
            trigger={
              <Button variant="outline" size="icon" className="lg:hidden select-none [-webkit-user-select:none] flex-shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            }
          >
            {CATEGORIES.map((cat) => (
              <MobileDrawerSelect.Item
                key={cat.name}
                label={cat.name}
                sublabel={cat.count}
                active={activeCategory === cat.name}
                onClick={() => { setActiveCategory(cat.name); setActiveTag(null); setDrawerOpen(false); }}
              />
            ))}
          </MobileDrawerSelect>
          {/* Mobile: active category pill */}
          <div className="lg:hidden">
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium select-none"
              >
                {activeCategory} ×
              </button>
            )}
          </div>
          {/* Desktop category filter */}
          <div className="hidden lg:block">
            <CategoryFilter activeCategory={activeCategory} onCategoryChange={(cat) => { setActiveCategory(cat); setActiveTag(null); }} />
          </div>
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="mb-10">
        <TagCloud activeTag={activeTag} onTagClick={setActiveTag} />
      </div>

      {/* Active tag indicator */}
      {activeTag && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing articles tagged <span className="text-primary font-medium">#{activeTag}</span>
        </p>
      )}

      {/* Main content + Sidebar */}
      <div className="flex gap-8 items-start">
        {/* Posts grid */}
        <div className="flex-1 min-w-0">
          {filteredPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} onTagClick={setActiveTag} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Sidebar: hidden on mobile/tablet, visible on large screens */}
        <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-24">
          <NewsletterWidget />
        </aside>
      </div>
    </div>
  );
}