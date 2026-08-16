// Blog knowledge base for AI clients (MCP).
// Exposes the full blog post corpus — list, search, and retrieve — so connected
// AI assistants (ChatGPT, Claude, Cursor, …) can use the posts as a knowledge base.
//
// The post corpus lives in the frontend data module (src/lib/blogData.js), which is
// pure static JS with no React/browser dependencies, so it can be imported here.
import { BLOG_POSTS } from '../../../src/lib/blogData.js';

// Lightweight metadata view (omit the heavy `content` body) for list/search results.
function meta(p: any) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    tags: p.tags,
    date: p.date,
    author: p.author,
    reading_time: p.readingTime || p.reading_time || null,
    url: `https://web3tech.site/blog/${p.slug}`,
  };
}

function scorePost(post: any, q: string): number {
  const hay = [
    (post.title || ''),
    (post.excerpt || ''),
    (post.category || ''),
    ((post.tags || []).join(' ')),
    (post.content || ''),
  ].join(' ').toLowerCase();
  if (!hay.includes(q)) return 0;
  // Weight matches in title/tags/excerpt higher than body matches.
  let score = 0;
  if ((post.title || '').toLowerCase().includes(q)) score += 10;
  if ((post.excerpt || '').toLowerCase().includes(q)) score += 5;
  if ((post.tags || []).some((t: string) => t.toLowerCase().includes(q))) score += 6;
  if ((post.category || '').toLowerCase().includes(q)) score += 4;
  // Body match weight scales with frequency.
  const body = (post.content || '').toLowerCase();
  let from = 0, count = 0;
  while ((from = body.indexOf(q, from)) !== -1) { count++; from += q.length; if (count > 20) break; }
  score += count;
  return score;
}

export default async function (req: Request) {
  let body: any = {};
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }
  } catch { body = {}; }

  const action = String(body.action || 'list').toLowerCase();

  // LIST — every post, metadata only (no heavy content body).
  if (action === 'list') {
    const posts = BLOG_POSTS.map(meta);
    return Response.json({
      action: 'list',
      count: posts.length,
      categories: [...new Set(BLOG_POSTS.map((p: any) => p.category))],
      posts,
    });
  }

  // SEARCH — rank posts by relevance to a free-text query.
  if (action === 'search') {
    const query = String(body.query || '').trim().toLowerCase();
    if (!query) {
      return Response.json({ error: 'A non-empty "query" is required for action=search.' }, { status: 400 });
    }
    const terms = query.split(/\s+/).filter(Boolean);
    // A post matches if ANY term hits; rank by summed score across terms.
    const ranked = BLOG_POSTS.map((p: any) => {
      const termScores = terms.map((t) => scorePost(p, t));
      const total = termScores.reduce((a: number, b: number) => a + b, 0);
      return { post: p, score: total };
    })
      .filter((r: any) => r.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    const limit = Math.min(parseInt(String(body.limit ?? '10'), 10) || 10, 30);
    const results = ranked.slice(0, limit).map((r: any) => meta(r.post));
    return Response.json({
      action: 'search',
      query,
      count: results.length,
      total_matches: ranked.length,
      results,
    });
  }

  // GET — full post content by slug.
  if (action === 'get') {
    const slug = String(body.slug || '').trim();
    if (!slug) {
      return Response.json({ error: 'A non-empty "slug" is required for action=get.' }, { status: 400 });
    }
    const post = BLOG_POSTS.find((p: any) => p.slug === slug);
    if (!post) {
      return Response.json({ error: `No post found with slug "${slug}". Use action=list to see available slugs.` }, { status: 404 });
    }
    return Response.json({
      action: 'get',
      post: {
        ...meta(post),
        content: post.content || '',
      },
    });
  }

  return Response.json({
    error: `Unknown action "${action}". Supported actions: list, search, get.`,
    hint: { list: 'List all posts (metadata only).', search: 'Search posts by free-text query.', get: 'Retrieve full post content by slug.' },
  }, { status: 400 });
}