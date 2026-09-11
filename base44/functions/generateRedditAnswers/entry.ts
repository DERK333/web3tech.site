import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { POSTS } from '../../shared/blogPostsMeta.js';

// Drafts genuine, value-first answers to recent questions in r/ethereum,
// r/linux, and r/netsec using the builder's Hugging Face model deployment.
// The blog is mentioned only when an article directly extends the answer.
// Admin-only: invoked on demand from the Reddit drafts page.
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';
const SITE_URL = 'https://web3tech.site';

const ANSWER_SUBS = {
  ethereum: {
    community: 'r/ethereum — Ethereum developers and users; technical, allergic to shilling, they respect precise and actionable answers',
    matchTags: ['Ethereum', 'Smart Contracts', 'Web3', 'Blockchain', 'Solidity', 'Crypto', 'DeFi', 'DApps', 'Token', 'RPC', 'Node', 'Mining'],
  },
  linux: {
    community: 'r/linux — Linux users and sysadmins; they respect command-line precision, distro awareness, and honest tradeoffs',
    matchTags: ['Linux', 'Ubuntu', 'Debian', 'Terminal', 'Command Line', 'bash', 'SysAdmin', 'Docker', 'SSH', 'systemd', 'Server', 'DevOps', 'File System', 'Troubleshooting', 'Kali Linux'],
  },
  netsec: {
    community: 'r/netsec — security professionals; they respect technical depth, threat-model thinking, and zero marketing',
    matchTags: ['Security', 'Cybersecurity', 'Firewall', 'SSH', 'Kali Linux', 'Phishing', 'Authentication', 'Privacy', 'Encryption', 'Hardening', 'Zero Trust', 'Tails', 'Tor'],
  },
};

function matchingPosts(subreddit) {
  const tags = new Set(ANSWER_SUBS[subreddit].matchTags);
  return POSTS
    .filter((p) => p.tags?.some((t) => tags.has(t)) || tags.has(p.category))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
}

// Pulls recent question-like posts from the subreddit's hot listing.
// Tries the JSON API first, then the Atom feed (which tolerates stricter
// rate limits), so the tool keeps working when one source blocks us.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'application/json, text/xml, */*',
};

async function fetchQuestionsFromJson(sub) {
  const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=30`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`Reddit JSON listing unavailable (${res.status})`);
  }
  const data = await res.json();
  return (data?.data?.children || [])
    .map((c) => c?.data || {})
    .filter((p) => !p.stickied && !p.over18 && p.title && p.title.includes('?') && (p.score ?? 0) >= 1)
    .map((p) => ({
      title: String(p.title).trim().slice(0, 300),
      excerpt: String(p.selftext || '').replace(/\s+/g, ' ').trim().slice(0, 900),
      url: `https://www.reddit.com${p.permalink}`,
    }));
}

async function fetchQuestionsFromFeed(sub) {
  const res = await fetch(`https://www.reddit.com/r/${sub}/hot/.rss?limit=30`, {
    headers: BROWSER_HEADERS,
  });
  if (!res.ok) {
    throw new Error(`Reddit feed unavailable (${res.status})`);
  }
  const xml = await res.text();
  const questions = [];
  const entries = xml.split('<entry>');
  for (const entry of entries.slice(1)) {
    const title = (entry.match(/<title>([^]*?)<\/title>/) || [])[1] || '';
    const href = (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
    const contentMatch = entry.match(/<content[^>]*>([^]*?)<\/content>/);
    const decodedText = (contentMatch ? contentMatch[1] : '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    if (title.includes('?') && href.includes('/comments/')) {
      questions.push({
        title: title.trim().slice(0, 300),
        excerpt: decodedText.slice(0, 900),
        url: href,
      });
    }
  }
  return questions;
}

async function fetchQuestions(sub) {
  try {
    const fromJson = await fetchQuestionsFromJson(sub);
    if (fromJson.length > 0) {
      return fromJson;
    }
  } catch (jsonError) {
    // fall through to the feed
  }
  try {
    return await fetchQuestionsFromFeed(sub);
  } catch (feedError) {
    throw new Error('Reddit listing unavailable — try again in a few minutes');
  }
}

function parseAnswer(raw) {
  // Model is asked for a JSON object; tolerate surrounding prose or code fences.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain a JSON object');
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!parsed.answer) {
    throw new Error('Model response missing answer');
  }
  return {
    answer: String(parsed.answer).trim(),
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
    const config = ANSWER_SUBS[body.subreddit];
    if (!config) {
      return Response.json({ error: 'Unknown subreddit' }, { status: 400 });
    }
    const count = Math.min(Math.max(Number(body.count) || 2, 1), 3);

    // Skip questions we already drafted answers for.
    const existing = await base44.entities.RedditDraft.filter({ kind: 'answer' });
    const draftedUrls = new Set((existing || []).map((d) => d.question_url).filter(Boolean));

    const questions = (await fetchQuestions(body.subreddit))
      .filter((q) => !draftedUrls.has(q.url))
      .slice(0, count);

    if (questions.length === 0) {
      return Response.json({
        status: 'ok',
        drafts: [],
        message: 'No new questions found right now — check back later.',
      });
    }

    const posts = matchingPosts(body.subreddit);
    const context = posts
      .map((p) => `- "${p.title}" — ${p.excerpt} [slug: ${p.slug}]`)
      .join('\n');

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('hugging_face');

    const drafts = [];
    for (const q of questions) {
      const hfResponse = await fetch(HF_ROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: HF_MODEL,
          max_tokens: 900,
          temperature: 0.6,
          messages: [
            {
              role: 'system',
              content:
                'You are a senior software engineer and hands-on Linux/blockchain/security practitioner who answers technical questions on Reddit with genuinely useful, precise help. You never sound promotional or like marketing copy.',
            },
            {
              role: 'user',
              content:
                `Write a Reddit comment answering a question from ${config.community}.\n\n` +
                `Question title: "${q.title}"\n` +
                `Question body (excerpt): "${q.excerpt || '(no body)'}"\n\n` +
                'Rules:\n' +
                '- Lead with value: give a direct, working answer — a command, a config option, or a concrete step wherever possible. First person, conversational but technically precise.\n' +
                '- Plain text only: no markdown headings, no bullet points, no links inside the answer.\n' +
                '- 120-250 words. If the question is vague, state the most likely interpretation and answer that.\n' +
                '- No hype, no price talk, no self-promotion inside the answer.\n' +
                '- Optionally close with ONE casual line mentioning a related article ONLY if it directly extends the answer, phrased like "I wrote a deeper walkthrough on this if useful: <url>". If none genuinely fits, use an empty string.\n\n' +
                `The author's related articles:\n${context}\n\n` +
                'Reply with ONLY a JSON object, no markdown fences:\n' +
                `{"answer": "the comment body", "link_line": "closing line with the article URL ${SITE_URL}/blog/<slug>, or empty string"}`,
            },
          ],
        }),
      });

      if (!hfResponse.ok) {
        continue; // try the next question rather than failing the whole batch
      }

      const hfData = await hfResponse.json();
      const rawText = hfData?.choices?.[0]?.message?.content;
      if (!rawText) {
        continue;
      }

      let answer;
      try {
        answer = parseAnswer(rawText);
      } catch {
        continue;
      }

      const draft = await base44.asServiceRole.entities.RedditDraft.create({
        subreddit: body.subreddit,
        kind: 'answer',
        title: q.title,
        body: answer.answer,
        link_line: answer.link_line,
        question_url: q.url,
        status: 'draft',
      });
      drafts.push(draft);
    }

    if (drafts.length === 0) {
      return Response.json({ error: 'Answer generation failed — try again in a few minutes' }, { status: 502 });
    }

    return Response.json({ status: 'ok', drafts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}