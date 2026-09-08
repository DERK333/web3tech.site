import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

    // Posts shared to LinkedIn in the last 7 days — those are the ones with
    // fresh comments worth replying to inside the 24-hour window.
    const since = Date.now() - SEVEN_DAYS_MS;
    const all = await base44.asServiceRole.entities.LinkedinPostedSlug.list(undefined, 1000);
    const recent = (all || []).filter((r) => new Date(r.created_date).getTime() >= since);
    if (recent.length === 0) {
      return Response.json({
        status: 'ok',
        reminder_sent: false,
        message: 'No LinkedIn shares in the last 7 days — no reminder needed.',
      });
    }

    const titlesBySlug = Object.fromEntries(POSTS.map((p) => [p.slug, p.title]));
    const shared = recent.map((r) => titlesBySlug[r.slug] || r.slug);

    const admins = await base44.asServiceRole.entities.User.list();
    const admin = (admins || []).find((u) => u.role === 'admin');
    if (!admin || !admin.email) {
      return Response.json({ status: 'ok', reminder_sent: false, message: 'No admin user found.' });
    }

    const body = `Quick LinkedIn check-in.

You shared ${shared.length === 1 ? 'this post' : 'these posts'} to LinkedIn in the last 7 days:

${shared.map((t) => `- ${t}`).join('\n')}

Spend 5 minutes today replying to any comments — LinkedIn's algorithm heavily rewards engagement within the first 24 hours, and early replies keep the post circulating.

— TheWeb3Tech automation`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: admin.email,
      subject: 'LinkedIn: reply to recent comments (24h engagement window)',
      body,
    });

    return Response.json({ status: 'ok', reminder_sent: true, posts: shared });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}