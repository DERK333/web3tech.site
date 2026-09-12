import { secrets } from "base44:runtime";

// The Turnstile site key is public by design — Cloudflare serves it to every
// visitor that loads the verification widget. This endpoint hands it to the
// subscription forms so the key lives in app settings instead of the bundle.
export default async function (req) {
  try {
    const siteKey = secrets.get("TURNSTILE_SITE_KEY");
    if (!siteKey) {
      return Response.json({ error: 'Turnstile site key not configured' }, { status: 503 });
    }
    return Response.json({ site_key: siteKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}