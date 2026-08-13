import React from "react";
import { Link } from "react-router-dom";
import { Terminal, ExternalLink, Rss } from "lucide-react";
import { AUTHOR } from "@/lib/blogData";

const RSS_URL = "https://web3tech.site/api/rssFeed";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="font-heading font-bold text-lg">TheWeb3Tech</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {AUTHOR.bio}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Navigate
            </h3>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/categories" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Categories</Link>
              <Link to="/tags" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Tags</Link>
              <Link to="/archive" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Archive</Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Search</Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              More
            </h3>
            <div className="space-y-2">
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              <Link to="/resources" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Resources</Link>
              <Link to="/testimonials" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
              <Link to="/subscribe" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Subscribe</Link>
              <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <a
                href={RSS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Rss className="w-3 h-3 text-orange-400" />
                RSS Feed
              </a>
            </div>
          </div>

          {/* External Blogs */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Also Find Us On
            </h3>
            <div className="space-y-2">
              {AUTHOR.blogs.map((blog) => (
                <a
                  key={blog.url}
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {blog.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TheWeb3Tech — Bold Insights on Crypto, Tech & Digital Innovation
          </p>
        </div>
      </div>
    </footer>
  );
}