// Blog data — single source of truth.
//
// The canonical post corpus lives in the backend-shared module
// base44/shared/blogPostsContent.js. Every post-consuming integration
// (sitemap, RSS feed, weekly digest, post-update notifications, LinkedIn
// sharing, Reddit drafts, AI knowledge base) bundles that SAME file, so
// adding a post object to it (front of the array) updates the live site
// and every integration automatically — one file, no other steps.
import { BLOG_POSTS as ALL_POSTS } from '../../../base44/shared/blogPostsContent.js';

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