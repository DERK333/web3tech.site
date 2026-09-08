import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';
import { postToLinkedIn } from '../../shared/linkedinPost.ts';

const SITE_URL = 'https://web3tech.site';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // The workflow calls this server-side (no user session). If a user calls
    // it directly, require admin.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {}

    // Track which slugs have already been cross-posted as weekly insights.
    const existing = await base44.asServiceRole.entities.LinkedinInsightSlug.list(undefined, 1000);
    const posted = new Set((existing || []).map((r) => r.slug));

    const sorted = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    // First-time setup: record every current post except the newest one as
    // already cross-posted, so the first weekly run covers the newest article.
    if (posted.size === 0) {
      const toSeed = sorted.slice(1);
      await base44.asServiceRole.entities.LinkedinInsightSlug.bulkCreate(
        toSeed.map((p) => ({ slug: p.slug }))
      );
      return Response.json({
        status: 'initialized',
        seeded: toSeed.length,
        next_candidate: sorted[0]?.slug,
        message:
          'Seeded existing posts as already cross-posted. Next weekly run will cross-post the newest article.',
      });
    }

    const candidates = sorted.filter((p) => !posted.has(p.slug));
    if (candidates.length === 0) {
      return Response.json({
        status: 'ok',
        message: 'All posts already cross-posted — add a new article first.',
      });
    }
    const post = candidates[0];
    const url = `${SITE_URL}/blog/${post.slug}`;

    // Generate a short, original practitioner insight (not a promo blurb).
    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are writing a LinkedIn post for a technical blogger who publishes on web3tech.site. Write a short, first-person insight post (90-130 words) based on this article.

Rules:
- Read like an original practitioner insight, NOT a "new article" announcement or promotion.
- Open with a specific, concrete observation or lesson from the article.
- Include one actionable tip the reader can try.
- End with a question that invites discussion.
- Plain text only. No URLs, no hashtags, no emojis, no markdown.

Article title: ${post.title}
Article summary: ${post.excerpt}

Return only the post text.`,
    });
    const insight = (typeof llm === 'string' ? llm : llm?.text ?? String(llm ?? '')).trim();
    if (!insight) {
      return Response.json({ error: 'Failed to generate insight text' }, { status: 502 });
    }

    const text = `${insight}\n\nI wrote up the full breakdown here: ${url}`;

    // Dry-run mode: return what would be posted without touching LinkedIn.
    if (body.dry_run) {
      return Response.json({ status: 'dry_run', slug: post.slug, text });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!meRes.ok) {
      return Response.json(
        { error: 'Failed to fetch LinkedIn profile', detail: await meRes.text() },
        { status: 502 }
      );
    }
    const me = await meRes.json();
    const authorUrn = `urn:li:person:${me.sub}`;

    await postToLinkedIn(accessToken, authorUrn, text);
    await base44.asServiceRole.entities.LinkedinInsightSlug.create({ slug: post.slug });
    return Response.json({ status: 'ok', slug: post.slug, text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}