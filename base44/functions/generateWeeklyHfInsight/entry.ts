import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Weekly AI technical insight: generated with the builder's Hugging Face
// model deployment, stored in WeeklyInsight, emailed to newsletter subscribers.
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';
const SITE_NAME = 'TheWeb3Tech';

// Rotate one topic per ISO week.
const TOPICS = [
  'Ethereum and Web3 infrastructure trends',
  'Linux server administration and DevOps automation',
  'Blockchain and smart-contract security',
  'Privacy-enhancing technologies and self-hosting',
];

function getWeekKey(now) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseInsight(raw) {
  // Model is asked for a JSON object; tolerate surrounding prose or code fences.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object');
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!parsed.title || !parsed.content) {
    throw new Error('Model response missing title or content');
  }
  return { title: String(parsed.title).trim(), content: String(parsed.content).trim() };
}

function buildInsightEmailHtml(topic, title, content) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `
        <tr>
          <td style="padding:0 24px;">
            <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#d1d5db;">${escapeHtml(p)}</p>
          </td>
        </tr>`)
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
                <h1 style="margin:0;font-size:26px;color:#f9fafb;font-weight:800;">Your weekly AI insight</h1>
                <p style="margin:8px 0 0 0;font-size:14px;color:#9ca3af;">${escapeHtml(topic)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 16px 24px;">
                <h2 style="margin:0;font-size:20px;line-height:1.3;color:#f9fafb;font-weight:700;">${escapeHtml(title)}</h2>
              </td>
            </tr>
            ${paragraphs}
            <tr>
              <td style="padding:8px 24px 24px 24px;">
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
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {}
    const dryRun = body.dry_run === true;

    // One insight per ISO week — skip if already generated.
    const { year, week } = getWeekKey(new Date());
    const weekKey = `${year}-W${String(week).padStart(2, '0')}`;

    const existing = await base44.asServiceRole.entities.WeeklyInsight.filter({ week_key: weekKey });
    if ((existing || []).length > 0) {
      return Response.json({ status: 'ok', already_generated: true, week_key: weekKey, insight: existing[0] });
    }

    const topic = TOPICS[week % TOPICS.length];

    // Generate the insight with the builder's Hugging Face model deployment.
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hugging_face');
    const hfResponse = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        max_tokens: 900,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior technical analyst for TheWeb3Tech, a publication for Web3 developers, Linux engineers, and security practitioners. You write concise, technically substantive weekly insights for hands-on practitioners.',
          },
          {
            role: 'user',
            content:
              `Write this week's technical insight on the topic: "${topic}". ` +
              'Reply with ONLY a JSON object, no markdown fences, in this exact shape: ' +
              '{"title": "punchy title under 70 characters", "content": "3-4 short paragraphs of plain text (no markdown, no headings, no bullet characters), roughly 150-220 words, giving practitioners a concrete, technically specific insight with at least one actionable takeaway"}.',
          },
        ],
      }),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return Response.json(
        { error: `Hugging Face inference failed (${hfResponse.status})`, details: errorText.slice(0, 500) },
        { status: 502 },
      );
    }

    const hfData = await hfResponse.json();
    const rawText = hfData?.choices?.[0]?.message?.content;
    if (!rawText) {
      return Response.json({ error: 'Hugging Face returned an empty completion' }, { status: 502 });
    }

    const { title, content } = parseInsight(rawText);

    const insight = await base44.asServiceRole.entities.WeeklyInsight.create({
      week_key: weekKey,
      topic,
      title,
      content,
      model: HF_MODEL,
    });

    // Dry run: everything above worked, skip the subscriber email blast.
    if (dryRun) {
      return Response.json({ status: 'ok', dry_run: true, week_key: weekKey, insight });
    }

    const subscribers = await base44.asServiceRole.entities.Subscriber.list(undefined, 1000);
    const emails = (subscribers || []).map((s) => s.email).filter(Boolean);
    if (emails.length === 0) {
      return Response.json({ status: 'ok', sent: 0, week_key: weekKey, message: 'Insight generated but no subscribers to email.' });
    }

    const subject = `Weekly AI Insight: ${title}`;
    const html = buildInsightEmailHtml(topic, title, content);

    let sent = 0;
    const failures = [];
    for (const email of emails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, html });
        sent++;
      } catch (e) {
        failures.push({ email, error: e.message });
      }
    }

    return Response.json({ status: 'ok', sent, total_subscribers: emails.length, week_key: weekKey, insight_id: insight.id, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}