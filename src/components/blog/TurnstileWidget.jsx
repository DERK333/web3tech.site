import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { base44 } from "@/api/base44Client";

// The site key is public by design — fetch it from the backend so it lives
// in app settings instead of the code bundle.
let siteKeyPromise = null;
function loadSiteKey() {
  if (!siteKeyPromise) {
    siteKeyPromise = base44.functions
      .invoke("getTurnstileSiteKey")
      .then((res) => res.data?.site_key || null)
      .catch(() => null);
  }
  return siteKeyPromise;
}

let scriptPromise = null;
function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Turnstile script failed to load"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Invisible Cloudflare verification widget. onToken fires with the one-time
// token once the visitor passes; the parent sends it with the submit and the
// backend validates it with Cloudflare before sending any email. Tokens are
// single-use, so parents call reset() after a failed submit to get a new one.
const TurnstileWidget = forwardRef(function TurnstileWidget({ onToken }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      onToken("");
    },
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [siteKey] = await Promise.all([loadSiteKey(), loadTurnstileScript()]);
        if (cancelled || !containerRef.current) return;
        if (!siteKey || !window.turnstile) {
          setFailed(true);
          return;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken]);

  if (failed) {
    return (
      <p className="text-xs text-destructive">
        Verification is unavailable right now — please try again later.
      </p>
    );
  }
  return <div ref={containerRef} className="min-h-[65px]" />;
});

export default TurnstileWidget;