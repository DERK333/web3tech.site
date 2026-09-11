import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';
import { verifySubscriptionRequest } from '../../shared/formSecret.js';

const CONFIRM_URL = 'https://web3tech.base44.app/functions/confirmSubscription';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_CONFIRM_EMAILS_PER_IP_PER_HOUR = 5;
const MAX_CONFIRM_EMAILS_PER_HOUR_GLOBAL = 10;

// The subscription forms are anonymous by design, but this function must not
// become an open mail relay. Only requests originating from the app's own
// pages (browser Origin/Referer) may trigger a confirmation email: the app's
// custom domain, or any *.base44.app host the platform serves the app on.
function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isFromOwnSite(req) {
  const hosts = [hostOf(req.headers.get('origin')), hostOf(req.headers.get('referer'))].filter(Boolean);
  return hosts.some((h) => h === 'web3tech.site' || h.endsWith('.base44.app'));
}

// Edge-verified client IP — set by the platform's proxy (Cloudflare), which
// strips client-supplied values, so this cannot be forged by the caller.
function getClientIp(req) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildConfirmEmailHtml(kind, postTitle, confirmUrl) {
  const intro = kind === 'newsletter'
    ? 'someone signed up for the <strong>TheWeb3Tech newsletter</strong> using this email address.'
    : `someone asked to be <strong>notified when "${escapeHtml(postTitle)}" is updated</strong> using this email address.`;
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0a0c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c10;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d1117;border:1px solid #1f2630;border-radius:12px;">
          <tr><td style="padding:32px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:13px;color:#10b981;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">TheWeb3Tech</p>
            <h1 style="margin:0 0 12px 0;font-size:24px;color:#f9fafb;font-weight:800;">Confirm your subscription</h1>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#9ca3af;">Hi there — ${intro} If that was you, confirm below. If not, just ignore this email: nothing else will ever be sent to this address.</p>
            <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#0a0c10;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Confirm subscription</a>
            <p style="margin:24px 0 0 0;font-size:12px;color:#4b5563;line-height:1.6;">This link expires in 24 hours. You can also copy and paste it into your browser:<br>${confirmUrl}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    if (!isFromOwnSite(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Origin headers alone are spoofable by direct HTTP clients, so sends are
    // also rate-limited server-side: a tight per-IP cap (the edge-verified
    // client IP cannot be forged by callers) plus a global hourly ceiling,
    // so even a rotating pool of IPs cannot relay more than a few emails.
    const clientIp = getClientIp(req);
    if (!clientIp) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {}

    // Shared-secret request signature — proves the caller is the app's own
    // form, not a script replaying this endpoint with forged Origin/Referer.
    if (!(await verifySubscriptionRequest(body, body.ts, body.sig))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recentSends = await base44.asServiceRole.entities.SubscriptionSendLog.list('-created_date', 30);
    const inWindow = (recentSends || []).filter(
      (l) => new Date(l.created_date).getTime() >= Date.now() - RATE_WINDOW_MS
    );
    if (inWindow.length >= MAX_CONFIRM_EMAILS_PER_HOUR_GLOBAL) {
      return Response.json({ error: 'Too many confirmation emails requested. Please try again later.' }, { status: 429 });
    }
    if (inWindow.filter((l) => l.client_ip === clientIp).length >= MAX_CONFIRM_EMAILS_PER_IP_PER_HOUR) {
      return Response.json({ error: 'Too many confirmation emails requested. Please try again later.' }, { status: 429 });
    }

    const kind = body.kind === 'post_update' ? 'post_update' : 'newsletter';
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254);
    const postSlug = String(body.post_slug || '');

    if (!isValidEmail(email)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (kind === 'post_update' && !POSTS.some((p) => p.slug === postSlug)) {
      return Response.json({ error: 'Unknown post' }, { status: 400 });
    }

    const isNewsletter = kind === 'newsletter';
    const entity = isNewsletter
      ? base44.asServiceRole.entities.Subscriber
      : base44.asServiceRole.entities.PostUpdateSubscriber;
    const query = isNewsletter ? { email } : { email, post_slug: postSlug };

    const existing = await entity.filter(query);
    if ((existing || []).some((r) => r.verified)) {
      return Response.json({ status: 'ok', already_subscribed: true });
    }
    let record = existing[0];

    // Throttle: max one confirmation email per address per 24h token window.
    if (record && record.verify_expires && new Date(record.verify_expires).getTime() > Date.now()) {
      return Response.json({ status: 'ok', confirmation_pending: true });
    }

    const token = generateToken();
    const verifyExpires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    if (record) {
      await entity.update(record.id, { verify_token: token, verify_expires: verifyExpires });
    } else {
      record = await entity.create(
        isNewsletter
          ? { email, verify_token: token, verify_expires: verifyExpires }
          : { email, post_slug: postSlug, notified: false, verify_token: token, verify_expires: verifyExpires }
      );
    }

    const post = isNewsletter ? null : POSTS.find((p) => p.slug === postSlug);
    const confirmUrl = `${CONFIRM_URL}?kind=${kind}&token=${token}`;
    const html = buildConfirmEmailHtml(kind, post ? post.title : null, confirmUrl);

    // Count this send against the IP's hourly cap before dispatching.
    const sendLog = await base44.asServiceRole.entities.SubscriptionSendLog.create({ client_ip: clientIp, email });

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: isNewsletter
          ? 'Confirm your subscription — TheWeb3Tech'
          : `Confirm your update notification — ${post.title}`,
        html,
      });
    } catch (e) {
      // Send failed — clear the token and the rate-log entry so the reader can retry immediately.
      await entity.update(record.id, { verify_token: null, verify_expires: null });
      await base44.asServiceRole.entities.SubscriptionSendLog.delete(sendLog.id);
      return Response.json({ error: 'Could not send confirmation email', details: e.message }, { status: 502 });
    }

    return Response.json({ status: 'ok', confirmation_sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}