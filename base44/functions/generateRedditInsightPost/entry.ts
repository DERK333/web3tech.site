import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

// Drafts an original Reddit insight post with the builder's Hugging Face
// model deployment, grounded in the blog's own related articles.
// Admin-only: invoked on demand from the Reddit drafts page.
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';
const SITE_URL = 'https://web3tech.site';

const SUBREDDITS = {
  web3: {
    community: 'r/web3 — Web3 builders and enthusiasts; they value concrete technical takes over hype and price talk',
    matchTags: ['Web3', 'Blockchain', 'Ethereum', 'Solana', 'IPFS', 'DePIN', 'Smart Contracts', 'Crypto', 'Token', 'DApps'],
  },
  selfhosted: {
    community: 'r/selfhosted — self-hosting hobbyists and homelabbers; they value practical setup lessons, gotchas, and honest tradeoffs',
    matchTags: ['Linux', 'Docker', 'Ubuntu', 'Debian', 'DevOps', 'Server', 'systemd', 'Virtualization', 'Firewall', 'SSH'],
  },
  privacyguides: {
    community: 'r/privacyguides — privacy-conscious users; they value actionable privacy improvements, threat-model thinking, and honest tool comparisons',
    matchTags: ['Privacy', 'Tails', 'Tor', 'Monero', 'Security', 'Authentication', 'Phishing'],
  },
};

function matchingPosts(subreddit) {
  const tags = new Set(SUBREDDITS[subreddit].matchTags);
  return POSTS
    .filter((p) => p.tags?.some((t) => tags.has(t)) || tags.has(p.category))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
}

function parseDraft(raw) {
  // Model is asked for a JSON object; tolerate surrounding prose or code fences.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object');
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!parsed.title || !parsed.body) {
    throw new Error('Model response missing title or body');
  }
  return {
    title: String(parsed.title).trim(),
    body: String(parsed.body).trim(),
    link_line: String(parsed.link_line || '').trim(),
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {}
    const config = SUBREDDITS[body.subreddit];
    if (!config) {
      return Response.json({ error: 'Unknown subreddit' }, { status: 400 });
    }

    const posts = matchingPosts(body.subreddit);
    const context = posts
      .map((p) => `- "${p.title}" — ${p.excerpt} [slug: ${p.slug}]`)
      .join('\n');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hugging_face');
    const hfResponse = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        max_tokens: 1200,
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software engineer and hands-on Linux/blockchain/security practitioner who shares original technical insights on Reddit. You write value-first, first-person posts that lead with genuinely useful technical content and never sound promotional or like marketing copy.',
          },
          {
            role: 'user',
            content:
              `Write an original insight post for ${config.community}.\n\n` +
              'Rules:\n' +
              '- Lead with value: the full insight must stand on its own, interesting even with zero links.\n' +
              '- First person, conversational but technically precise. Plain text only: no markdown headings, no bullet points, no links inside the body.\n' +
              '- 200-350 words, one clear takeaway, and at least one concrete technical detail (a command, a config option, or a number).\n' +
              '- No hype, no price talk, no self-promotion inside the body.\n' +
              '- Optionally end with a single casual line mentioning one of the author\'s related articles ONLY if it directly extends the insight, phrased like "I wrote a deeper walkthrough on this if useful: <url>". If none fits, use an empty string.\n\n' +
              `The author's related articles:\n${context}\n\n` +
              'Reply with ONLY a JSON object, no markdown fences:\n' +
              `{"title": "under 100 characters, specific and curiosity-driving, not clickbait", "body": "the post body", "link_line": "closing line with the article URL ${SITE_URL}/blog/<slug>, or empty string"}`,
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

    const { title, body: postBody, link_line } = parseDraft(rawText);

    const draft = await base44.asServiceRole.entities.RedditDraft.create({
      subreddit: body.subreddit,
      title,
      body: postBody,
      link_line,
      status: 'draft',
    });

    return Response.json({ status: 'ok', draft });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}