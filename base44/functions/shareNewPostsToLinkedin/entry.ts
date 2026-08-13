import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

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

    // Builder's shared LinkedIn connection.
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');

    // Resolve the member URN (urn:li:person:<sub>) used as the post author.
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

    // Track which slugs have already been shared.
    const existing = await base44.asServiceRole.entities.LinkedinPostedSlug.list(undefined, 1000);
    const posted = new Set((existing || []).map((r) => r.slug));

    // First-time setup: record every current post as already-shared WITHOUT
    // posting, so only posts added after setup get shared (no mass blast).
    if (posted.size === 0) {
      await base44.asServiceRole.entities.LinkedinPostedSlug.bulkCreate(
        POSTS.map((p) => ({ slug: p.slug }))
      );
      return Response.json({
        status: 'initialized',
        seeded: POSTS.length,
        message:
          'Seeded existing posts as already-shared. Future publishes will share only new posts.',
      });
    }

    const newPosts = POSTS.filter((p) => !posted.has(p.slug));
    const shared = [];
    const errors = [];

    for (const post of newPosts) {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const text = `New on TheWeb3Tech: ${post.title}\n\n${post.excerpt}\n\n${url}`;
      try {
        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Method': 'CREATE',
          },
          body: JSON.stringify({
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
          }),
        });
        if (res.ok) {
          await base44.asServiceRole.entities.LinkedinPostedSlug.create({ slug: post.slug });
          shared.push(post.slug);
        } else {
          errors.push({ slug: post.slug, status: res.status, detail: await res.text() });
        }
      } catch (e) {
        errors.push({ slug: post.slug, error: e.message });
      }
    }

    return Response.json({
      status: 'ok',
      newPosts: newPosts.length,
      shared,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}