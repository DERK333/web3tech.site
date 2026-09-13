// Derived post metadata for backend functions (sitemap, RSS feed, and
// subscription post-update validation). Do NOT add posts here by hand —
// this list is derived automatically from the single backend post corpus in
// blogPostsContent.js, which is regenerated from the site's real post data
// (src/lib blog modules) whenever posts change. A post published on the site
// therefore appears in the sitemap and RSS feed as soon as the mirror is
// refreshed — no second hand-maintained list to forget.
import { BLOG_POSTS } from './blogPostsContent.js';

export const POSTS = BLOG_POSTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  date: p.date,
  author: p.author,
  category: p.category,
  tags: p.tags || [],
  image: p.image || '',
}));