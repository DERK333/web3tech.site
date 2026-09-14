// Shared HMAC signing for double-opt-in confirmation links.
//
// confirmSubscription is publicly reachable by design (subscribers click an
// emailed link), so the caller is verified with TWO shared secrets: the
// one-time verify token (already random and stored server-side) AND a
// signature over that token computed with CONFIRM_LINK_SECRET, which only
// this server holds. A request that was not issued by this app's own
// confirmation emails can never carry a valid signature.
import { secrets } from 'base44:runtime';

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacKey() {
  const secret = secrets.get('CONFIRM_LINK_SECRET');
  if (!secret) throw new Error('CONFIRM_LINK_SECRET is not set');
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

// Signature over a confirm token — hex-encoded HMAC-SHA256.
export async function signConfirmToken(token) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(token));
  return toHex(sig);
}

// Constant-time equality so signature comparison does not leak timing info.
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// True only when sig is a valid signature of token issued by this server.
export async function verifyConfirmSignature(token, sig) {
  if (!/^[a-f0-9]{64}$/.test(token) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  const expected = await signConfirmToken(token);
  return timingSafeEqual(expected, sig);
}