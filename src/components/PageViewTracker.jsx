import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// GA4 measurement ID — must match the gtag config in index.html
const GA_MEASUREMENT_ID = "G-DFDHJ3XT2V";

/**
 * Fires a GA4 `page_view` event on every client-side route change.
 *
 * This app is a single-page React Router app, so gtag's initial page load in
 * index.html only records the entry URL. Without manual page_view events on
 * navigation, individual blog post views (/blog/<slug>) are never recorded.
 */
export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const pagePath = location.pathname + location.search;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.origin + pagePath,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [location.pathname, location.search]);

  return null;
}