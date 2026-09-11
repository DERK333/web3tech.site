// Browser-side signer for the anonymous subscription confirmation requests.
// Signs each request with an HMAC so sendSubscriptionConfirmation can verify
// the caller is the app's own form (headers alone are spoofable). This is the
// FRONTEND copy — keep the secret in sync with base44/shared/formSecret.js,
// which holds the server-side verifier.
// The key ships in the public bundle by design: it is a caller attestation,
// not a vault secret; server-side rate limits remain the hard anti-abuse cap.

const FORM_SECRET = '9f3c61a7e245d80b4c7e1a9f6b2d48035ec17a2b9d6f1e48c05b3a7d92e41603';

function normalizeSubscriptionFields(fields) {
  const kind = fields.kind === 'post_update' ? 'post_update' : 'newsletter';
  const email = String(fields.email || '').trim().toLowerCase().slice(0, 254);
  const postSlug = String(fields.post_slug || '');
  return { kind, email, postSlug };
}

async function hmacHex(message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(FORM_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Sign a subscription request; returns the full payload to send.
export async function signSubscriptionRequest(fields) {
  const { kind, email, postSlug } = normalizeSubscriptionFields(fields);
  const ts = Date.now();
  const sig = await hmacHex(`${kind}|${email}|${postSlug}|${ts}`);
  return { kind, email, post_slug: postSlug, ts, sig };
}