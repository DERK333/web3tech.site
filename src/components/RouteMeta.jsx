import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_META } from "@/lib/routeMeta";

// Sets a unique <title> and meta description for every static route.
// Article pages (/blog/:slug) set their own meta in BlogPost.jsx.
export default function RouteMeta() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/blog/")) return;
    const meta = ROUTE_META[location.pathname];
    if (!meta) return;

    document.title = meta.title;
    let desc = document.querySelector("meta[name='description']");
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", meta.description);
  }, [location.pathname]);

  return null;
}