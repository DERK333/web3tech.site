import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlPage(title, message) {
  return new Response(
    `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:0;background:#0a0c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0c10;min-height:100vh;">
      <tr><td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#0d1117;border:1px solid #1f2630;border-radius:12px;">
          <tr><td style="padding:32px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:13px;color:#10b981;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">TheWeb3Tech</p>
            <h1 style="margin:0 0 12px 0;font-size:22px;color:#f9fafb;font-weight:800;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#9ca3af;">${escapeHtml(message)}</p>
            <a href="https://web3tech.site" style="display:inline-block;padding:10px 20px;background:#10b981;color:#0a0c10;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">Visit TheWeb3Tech</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Token normally arrives via the email link's query string; a JSON body is
    // also accepted so the flow is testable programmatically.
    const urlStr = String(req.url || '');
    const qIndex = urlStr.indexOf('?');
    const params = new URLSearchParams(qIndex >= 0 ? urlStr.slice(qIndex + 1) : '');
    if (!params.get('token')) {
      try {
        const body = await req.json();
        if (body && body.token) {
          if (body.kind) params.set('kind', String(body.kind));
          params.set('token', String(body.token));
        }
      } catch {}
    }

    const kind = params.get('kind') === 'post_update' ? 'post_update' : 'newsletter';
    const token = params.get('token') || '';

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return htmlPage('Invalid link', 'This confirmation link is invalid. Please subscribe again from the site.');
    }

    const entity = kind === 'post_update'
      ? base44.asServiceRole.entities.PostUpdateSubscriber
      : base44.asServiceRole.entities.Subscriber;

    const matches = await entity.filter({ verify_token: token });
    const record = (matches || [])[0];
    if (!record) {
      return htmlPage('Invalid link', 'This confirmation link has already been used or does not exist. If you still want notifications, please subscribe again from the site.');
    }

    if (record.verify_expires && new Date(record.verify_expires).getTime() < Date.now()) {
      return htmlPage('Link expired', 'This confirmation link has expired. Please subscribe again from the site.');
    }

    await entity.update(record.id, { verified: true, verify_token: null, verify_expires: null });

    return htmlPage(
      'Subscription confirmed',
      kind === 'post_update'
        ? 'Your email is confirmed — you will be notified when the guide is updated.'
        : 'Your email is confirmed — you will now receive the newsletter.'
    );
  } catch (error) {
    return htmlPage('Something went wrong', 'We could not confirm your subscription. Please try subscribing again from the site.');
  }
}