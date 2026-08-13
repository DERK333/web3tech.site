import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Info, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const BASE_TABS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Blog", path: "/blog", icon: BookOpen },
  { label: "About", path: "/about", icon: Info },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const TABS = isAuthenticated
    ? [...BASE_TABS, { label: "Settings", path: "/settings", icon: Settings }]
    : BASE_TABS;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active =
            location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors select-none [-webkit-user-select:none] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}