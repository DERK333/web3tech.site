import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

// Same post source the rssFeed function serves — single source of truth.
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

    // Pending update-notification subscriptions.
    const pending = await base44.asServiceRole.entities.PostUpdateSubscriber.filter(
      { notified: false, verified: true },
      undefined,
      1000
    );

    if (!pending || pending.length === 0) {
      return Response.json({ status: 'ok', sent: 0, message: 'No pending update subscriptions.' });
    }

    const postBySlug = new Map(POSTS.map((p) => [p.slug, p]));
    let sent = 0;
    const failures = [];
    const notifiedIds = [];

    for (const sub of pending) {
      const post = postBySlug.get(sub.post_slug);
      if (!post) {
        // Post no longer exists — mark notified so it never loops forever.
        notifiedIds.push(sub.id);
        continue;
      }

      // "Updated" means the post's publish date is newer than the subscription.
      const subscribedAt = new Date(sub.created_date).getTime();
      const publishedAt = new Date(post.date).getTime();
      if (!(publishedAt > subscribedAt)) continue;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.email,
          subject: `Updated: ${post.title}`,
          text: `The guide "${post.title}" was just updated: ${SITE_URL}/blog/${post.slug}`,
        });
        sent++;
        notifiedIds.push(sub.id);
      } catch (e) {
        failures.push({ email: sub.email, slug: sub.post_slug, error: e.message });
      }
    }

    // Mark only the ones we actually notified (or whose post vanished).
    if (notifiedIds.length > 0) {
      await base44.asServiceRole.entities.PostUpdateSubscriber.bulkUpdate(
        notifiedIds.map((id) => ({ id, notified: true }))
      );
    }

    return Response.json({ status: 'ok', sent, pending: pending.length, marked: notifiedIds.length, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}