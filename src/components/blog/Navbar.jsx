import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Terminal, Search, Sun, Moon, ArrowLeft, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchOverlay from "@/components/blog/SearchOverlay";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/AuthContext";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Tools", path: "https://sites.google.com/view/theweb3tech/begin", external: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { isAuthenticated } = useAuth();

  // Show back button on sub-pages (blog posts, etc.)
  const isChildRoute = location.pathname !== "/" && location.pathname !== "/blog" && location.pathname !== "/about" && location.pathname !== "/contact" && location.pathname !== "/settings";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/blog");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Back button on child routes (mobile) */}
          {isChildRoute && (
            <button
              onClick={handleBack}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground select-none [-webkit-user-select:none] mr-1"
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

          {/* Desktop links shown at lg+ (1024px). Tablets get the bottom nav. */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => 
              link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            {isAuthenticated && (
              <Link
                to="/analytics"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === "/analytics"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                Analytics
              </Link>
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 bg-background rounded border border-border/50">⌘K</kbd>
            </button>
            <button
              onClick={toggle}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="ml-1 p-2 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated && (
              <Link
                to="/settings"
                className={`ml-1 p-2 rounded-lg border border-border/50 bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all ${location.pathname === "/settings" ? "text-primary border-primary/30" : ""}`}
                title="Settings"
              >
                <UserCircle className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile + tablet controls (below lg) */}
          <div className="lg:hidden flex items-center gap-2">
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
                  {isAuthenticated && (
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
                  </div>
                  </motion.div>
                  )}
                  </AnimatePresence>
    </nav>
    </>
  );
}