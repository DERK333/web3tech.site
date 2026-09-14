// Blog data — frontend view of the post corpus.
//
// The canonical corpus is base44/shared/blogPostsContent.js — it is what
// every post-consuming integration (sitemap, RSS feed, weekly digest,
// post-update notifications, LinkedIn sharing, Reddit drafts, and the AI
// knowledge base) bundles automatically. The frontend cannot import across
// the frontend/backend boundary, so src/lib/blogPostsContent.js is a
// byte-identical generated copy of that canonical file — both are updated
// together whenever a post is added (the two stay in exact sync).
import { BLOG_POSTS as ALL_POSTS } from './blogPostsContent.js';

// Safety net: deduplicate by slug (the corpus is authored unique).
const seenSlugs = new Set();
export const BLOG_POSTS = ALL_POSTS.filter((p) => {
  if (seenSlugs.has(p.slug)) return false;
  seenSlugs.add(p.slug);
  return true;
});

export const CATEGORIES = [
  { name: "All", count: BLOG_POSTS.length },
  { name: "Blockchain", count: BLOG_POSTS.filter(p => p.category === "Blockchain").length },
  { name: "Security", count: BLOG_POSTS.filter(p => p.category === "Security").length },
  { name: "Linux", count: BLOG_POSTS.filter(p => p.category === "Linux").length },
  { name: "Privacy", count: BLOG_POSTS.filter(p => p.category === "Privacy").length },
  { name: "Software", count: BLOG_POSTS.filter(p => p.category === "Software").length },
  { name: "Emerging Tech", count: BLOG_POSTS.filter(p => p.category === "Emerging Tech").length },
];

export const AUTHOR = {
  name: "Derrk Samuel",
  bio: "Web3, crypto, and Linux PC insights — practical guides, security tips, mining setups, blockchain tools, and decentralized tech strategies for techs.",
  blogs: [
    { name: "The Web3 Tech", url: "https://web3tech.site" },
    { name: "TechDerks Insights", url: "https://techderksinsights.blogspot.com" }
  ]
};