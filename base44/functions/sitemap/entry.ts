import { POSTS } from '../../shared/blogPostsMeta.js';

const SITE_URL = 'https://web3tech.site';

// Core site pages (categories live as filters on /blog, not separate routes).
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/blog', priority: '0.9', changefreq: 'daily' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
];

function today() {
  return new Date().toISOString().split('T')[0];
}

function buildSitemap() {
  const now = today();

  const staticUrls = STATIC_PAGES.map((p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  // One URL per published post, with the post's publish date as lastmod.
  // Posts are the only indexable per-post pages, so this list is the
  // authoritative set — derived from the same shared metadata as the RSS feed.
  const postUrls = POSTS.map((post) => {
    const lastmod = post.date || now;
    return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>`;
}

Deno.serve(async (_req) => {
  const xml = buildSitemap();
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
});