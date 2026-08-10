import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { POSTS } from '../../shared/blogPostsMeta.js';

const SITE_URL = 'https://web3tech.site';
const SITE_TITLE = 'Web3Tech — Web3, Crypto & Linux Insights';
const SITE_DESCRIPTION = 'Web3, crypto, and Linux PC insights — practical guides, security tips, mining setups, blockchain tools, and decentralized tech strategies for techs.';
const AUTHOR_NAME = 'Derrk Samuel';

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRss(posts) {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastBuildDate = new Date(sorted[0]?.date || Date.now()).toUTCString();

  const items = sorted.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();
    const cats = (post.tags || []).map((t) => `    <category>${escapeXml(t)}</category>`).join('\n');
    return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${escapeXml(post.excerpt)}</description>
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${escapeXml(AUTHOR_NAME)}</dc:creator>
${cats}
    <enclosure url="${escapeXml(post.image)}" type="image/jpeg" length="0"/>
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>${escapeXml(AUTHOR_NAME)}</managingEditor>
    <generator>Web3Tech RSS Generator</generator>
    <atom:link href="${SITE_URL}/api/rssFeed" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

Deno.serve(async (_req) => {
  const xml = buildRss(POSTS);
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
});