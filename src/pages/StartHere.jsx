import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Server, ShieldCheck, Ghost, FlaskConical, Compass, Sparkles } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blogData";
import ReadingPath from "@/components/blog/ReadingPath";
import NewsletterWidget from "@/components/blog/NewsletterWidget";

// Curated beginner paths — post slugs in reading order
const PATHS = [
  {
    icon: Server,
    title: "Get your first Ethereum node running",
    description: "Go from zero to a working blockchain node in Docker, then interact with real smart contracts.",
    slugs: [
      "ethereum-node-docker-geth-setup-guide",
      "docker-containers-smart-contract-interaction",
      "smart-contract-interactions-private-networks",
      "send-crypto-command-line-cli-guide",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Harden your Linux server",
    description: "Lock down remote access, firewall the basics, and host your first site the safe way.",
    slugs: [
      "linux-ssh-hardening-guide",
      "linux-ufw-firewall-setup-guide",
      "change-root-password-switch-accounts-ubuntu-server",
      "host-website-app-ubuntu-2504-linux-server-guide",
    ],
  },
  {
    icon: Ghost,
    title: "Understand Web3 privacy",
    description: "Build an anonymous, persistent workspace and protect your accounts from real-world threats.",
    slugs: [
      "tailsos-bootable-usb-persistent-storage-full-guide",
      "flash-tails-os-512gb-ssd-internal-drive-guide",
      "benefits-google-advanced-protection-program",
      "crypto-scam-safeguards-community-onboarding",
    ],
  },
  {
    icon: FlaskConical,
    title: "Build a security lab on your own PC",
    description: "Run Kali Linux and security tools safely — no spare hardware, no risky dual-boots.",
    slugs: [
      "install-kali-linux-wsl2-windows-11-win-kex-gui",
      "debian-vm-pixel-9a-kali-tools-no-root",
      "hidden-cybersecurity-toolkit-5-resources-pros",
    ],
  },
];

export default function StartHere() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Start Here - Web3 Insights Hub";
    const desc = document.querySelector("meta[name='description']");
    if (desc) desc.setAttribute(
      "content",
      "New to Web3, crypto, or Linux? Start here. Follow four curated beginner reading paths — run an Ethereum node, harden a Linux server, protect your privacy, and build a security lab."
    );
  }, []);

  const paths = PATHS.map((path) => ({
    ...path,
    posts: path.slugs
      .map((slug) => BLOG_POSTS.find((p) => p.slug === slug))
      .filter(Boolean),
  })).filter((path) => path.posts.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <Compass className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
          New to Web3 Insights Hub? Start here.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Four curated paths take you from complete beginner to hands-on practitioner —
          follow them in order, or jump to whichever goal fits you. Every guide is
          beginner-friendly and works on hardware you already own.
        </p>
      </motion.div>

      {/* Reading paths */}
      <div className="space-y-6">
        {paths.map((path, i) => (
          <ReadingPath
            key={path.title}
            icon={path.icon}
            title={path.title}
            description={path.description}
            posts={path.posts}
            index={i}
          />
        ))}
      </div>

      {/* Newsletter signup */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35 }}
        className="mt-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-lg text-foreground">Keep the guides coming</h2>
        </div>
        <p className="text-xs text-muted-foreground text-center mb-5 max-w-md mx-auto leading-relaxed">
          New tutorials land every week — get them in your inbox the moment they publish.
        </p>
        <NewsletterWidget />
      </motion.div>
    </div>
  );
}