import React, { useState } from "react";
import { Twitter, Linkedin, Facebook, Link, Check } from "lucide-react";

const buttons = [
  {
    label: "Twitter",
    icon: Twitter,
    color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30",
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    icon: Linkedin,
    color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30",
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    icon: Facebook,
    color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30",
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export default function ShareButtons({ post }) {
  const title = post?.title || "";
  const [copied, setCopied] = useState(false);
  // Share the conversion-optimized landing page for this post
  const url = post?.slug
    ? `${window.location.origin}/share/${post.slug}`
    : window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Share:</span>
      {buttons.map(({ label, icon: Icon, color, getUrl }) => (
        <a
          key={label}
          href={getUrl(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${label}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground text-xs font-medium transition-all duration-200 ${color}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="Copy link"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium transition-all duration-200 ${
          copied
            ? "bg-primary/10 text-primary border-primary/30"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}