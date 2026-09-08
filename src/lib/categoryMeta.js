// Shared category registry — powers the Categories listing and the
// indexable /categories/:slug landing pages.
import { Code, Shield, Terminal, Eye, Box } from "lucide-react";

export const CATEGORY_META = {
  Blockchain: {
    icon: Box,
    slug: "blockchain",
    desc: "Smart contracts, Ethereum, Kaspa, Monero, node setups, and Docker-based blockchain tooling.",
    metaTitle: "Blockchain & Web3 Tutorials - Web3 Insights Hub",
    metaDesc: "Hands-on blockchain tutorials: run Ethereum and Kaspa nodes, interact with smart contracts, mine Kaspa and Monero, and containerize Web3 tooling with Docker.",
  },
  Security: {
    icon: Shield,
    slug: "security",
    desc: "TailsOS, phishing defense, Google Advanced Protection, hardening, and operational security.",
    metaTitle: "Cybersecurity Tutorials - Web3 Insights Hub",
    metaDesc: "Practical security guides: TailsOS bootable USBs, Kali Linux on WSL2, phishing defense, Google Advanced Protection, and SSH and firewall hardening.",
  },
  Linux: {
    icon: Terminal,
    slug: "linux",
    desc: "Ubuntu, Debian, Docker, system administration, partitioning, and server management.",
    metaTitle: "Linux Tutorials - Web3 Insights Hub",
    metaDesc: "Linux tutorials for practitioners: Ubuntu and Debian administration, Docker and Compose, systemd services, disk management, and full server setup guides.",
  },
  Privacy: {
    icon: Eye,
    slug: "privacy",
    desc: "Tor, Tails, anonymous browsing, and tools for protecting your digital footprint.",
    metaTitle: "Privacy Guides - Web3 Insights Hub",
    metaDesc: "Privacy-focused guides: TailsOS with persistent storage, Tor routing, and the tools that protect your digital footprint from trackers and surveillance.",
  },
  Software: {
    icon: Code,
    slug: "software",
    desc: "Trusted download sources, Windows utilities, developer tools, and productivity apps.",
    metaTitle: "Software Guides & Reviews - Web3 Insights Hub",
    metaDesc: "Software guides and reviews: trusted download sources, Windows utilities, AI tools like Obsidian and Hugging Face, and everyday productivity apps.",
  },
};

export const findCategoryBySlug = (slug) =>
  Object.entries(CATEGORY_META).find(([, meta]) => meta.slug === slug);