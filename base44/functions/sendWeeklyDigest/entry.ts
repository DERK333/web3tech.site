import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

// Same post source the rssFeed function serves — single source of truth.
const SITE_URL = 'https://web3tech.site';
const SITE_NAME = 'TheWeb3Tech';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPostDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildDigestHtml(posts) {
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `
      <tr>
        <td style="padding:0 24px 28px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border:1px solid #1f2630;border-radius:12px;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 8px 0;font-size:12px;color:#10b981;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                  ${escapeHtml(post.category)} &middot; ${escapeHtml(formatPostDate(post.date))}
                </p>
                <h2 style="margin:0 0 10px 0;font-size:20px;line-height:1.3;color:#f9fafb;font-weight:700;">
                  <a href="${url}" style="color:#f9fafb;text-decoration:none;">${escapeHtml(post.title)}</a>
                </h2>
                <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#9ca3af;">
                  ${escapeHtml(post.excerpt)}
                </p>
                <a href="${url}" style="display:inline-block;padding:10px 18px;background:#10b981;color:#0a0c10;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
                  Read the article &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0a0c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c10;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 24px 24px 24px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#10b981;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">${SITE_NAME}</p>
                <h1 style="margin:0;font-size:26px;color:#f9fafb;font-weight:800;">Your weekly digest</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#9ca3af;">${posts.length} new ${posts.length === 1 ? 'article' : 'articles'} this week</p>
              </td>
            </tr>
            ${items}
            <tr>
              <td style="padding:8px 24px 24px 24px;">
                <p style="margin:0 0 6px 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                  Thanks for reading — see everything at <a href="${SITE_URL}" style="color:#10b981;text-decoration:none;">${SITE_URL.replace('https://', '')}</a>.
                </p>
                <p style="margin:0;font-size:12px;color:#4b5563;">You're receiving this because you subscribed to the ${SITE_NAME} newsletter.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

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

    // The 3 most recent posts published in the last 7 days.
    const since = Date.now() - SEVEN_DAYS_MS;
    const recent = POSTS
      .filter((p) => new Date(p.date).getTime() >= since)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    if (recent.length === 0) {
      return Response.json({ status: 'ok', sent: 0, posts: 0, message: 'No new posts in the last 7 days — digest skipped.' });
    }

    // All newsletter subscribers.
    const subscribers = await base44.asServiceRole.entities.Subscriber.list(undefined, 1000);
    const emails = (subscribers || []).map((s) => s.email).filter(Boolean);
    if (emails.length === 0) {
      return Response.json({ status: 'ok', sent: 0, posts: recent.length, message: 'No subscribers — nothing to send.' });
    }

    const subject = `Web3 Insights Hub: ${recent.length} new posts this week`;
    const html = buildDigestHtml(recent);

    let sent = 0;
    const failures = [];
    for (const email of emails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          html,
        });
        sent++;
      } catch (e) {
        failures.push({ email, error: e.message });
      }
    }

    return Response.json({ status: 'ok', sent, total_subscribers: emails.length, posts: recent.length, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}