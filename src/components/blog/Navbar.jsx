import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Terminal, Search, Sun, Moon, ArrowLeft, UserCircle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "@/components/blog/SearchOverlay";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/AuthContext";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Blog", path: "/blog" },
  { label: "Start here", path: "/start" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Connect AI", path: "/connect" },
  { label: "Assistant", path: "/assistant" },
  { label: "Tools", path: "https://sites.google.com/view/theweb3tech/begin", external: true },
];

// How long the slide-out stays visible after the pointer leaves it
const HIDE_DELAY_MS = 1200;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideTimer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { isAuthenticated, user } = useAuth();

  // Show back button on sub-pages (blog posts, etc.)
  const isChildRoute = location.pathname !== "/" && location.pathname !== "/blog" && location.pathname !== "/about" && location.pathname !== "/contact" && location.pathname !== "/settings";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/blog");
    }
  };

  // Desktop slide-out controls: open on hover/click, hide automatically
  const cancelHide = () => clearTimeout(hideTimer.current);
  const openDrawer = () => { cancelHide(); setDrawerOpen(true); };
  const hideDrawer = () => { cancelHide(); setDrawerOpen(false); };
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = setTimeout(() => setDrawerOpen(false), HIDE_DELAY_MS);
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Hide automatically when navigating anywhere
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") hideDrawer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const linkClasses = (path) =>
    `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      location.pathname === path
        ? "text-primary bg-primary/10"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

    {/* Mobile + tablet top bar (below lg) — unchanged */}
    <nav
      className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Back button on child routes (mobile) */}
          {isChildRoute && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground select-none [-webkit-user-select:none] mr-1"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">
              TheWeb3Tech
            </span>
          </Link>

          {/* Mobile + tablet controls (below lg) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) =>
                link.external ? (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                    )
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/analytics"
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === "/analytics"
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      Analytics
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/reddit"
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        location.pathname === "/reddit"
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      Reddit drafts
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 mt-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                  )}
                  </div>
                  </motion.div>
                  )}
                  </AnimatePresence>
    </nav>

    {/* Desktop slide-out navigation (lg+) */}

    {/* Hover zone along the left edge: pointer at the edge slides the drawer out */}
    <div
      className="hidden lg:block fixed left-0 top-0 bottom-0 w-4 z-40"
      onMouseEnter={openDrawer}
      onMouseLeave={scheduleHide}
      aria-hidden="true"
    />

    {/* Floating trigger tab, visible while the drawer is hidden */}
    <button
      onClick={openDrawer}
      onMouseEnter={openDrawer}
      onMouseLeave={scheduleHide}
      aria-label="Open navigation"
      className={`hidden lg:flex fixed left-0 top-6 z-50 items-center gap-2 rounded-r-xl border border-l-0 border-border/50 bg-card/95 backdrop-blur-xl px-3 py-2.5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 ${
        drawerOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Menu className="w-5 h-5" />
      <span className="text-xs font-semibold tracking-wide">MENU</span>
    </button>

    {/* The drawer itself: slides from the left, hides automatically */}
    <aside
      role="navigation"
      aria-label="Main navigation"
      className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-72 flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={openDrawer}
      onMouseLeave={scheduleHide}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border/50">
        <Link to="/" onClick={hideDrawer} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">TheWeb3Tech</span>
        </Link>
        <button
          onClick={hideDrawer}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) =>
          link.external ? (
            <a
              key={link.path}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              onClick={hideDrawer}
              className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.path} to={link.path} onClick={hideDrawer} className={linkClasses(link.path)}>
              {link.label}
            </Link>
          )
        )}
        {user?.role === "admin" && (
          <>
            <Link to="/analytics" onClick={hideDrawer} className={linkClasses("/analytics")}>Analytics</Link>
            <Link to="/reddit" onClick={hideDrawer} className={linkClasses("/reddit")}>Reddit drafts</Link>
          </>
        )}
      </nav>

      {/* Bottom utilities */}
      <div className="border-t border-border/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { hideDrawer(); setSearchOpen(true); }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm"
          >
            <Search className="w-4 h-4" /> Search
            <kbd className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border/50">⌘K</kbd>
          </button>
          <button
            onClick={toggle}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2.5 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {isAuthenticated ? (
          <Link
            to="/settings"
            onClick={hideDrawer}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm ${
              location.pathname === "/settings" ? "text-primary border-primary/30" : ""
            }`}
          >
            <UserCircle className="w-4 h-4" /> Settings
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={hideDrawer}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        )}
      </div>
    </aside>
    </>
  );
}