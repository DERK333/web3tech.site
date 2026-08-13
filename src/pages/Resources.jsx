import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Boxes, Shield, Terminal, Code, BookOpen } from "lucide-react";

const RESOURCE_GROUPS = [
  {
    icon: Boxes,
    title: "Blockchain & Web3",
    links: [
      { name: "Ethereum Docs", url: "https://ethereum.org/developers", desc: "Official Ethereum developer documentation." },
      { name: "Solidity Language", url: "https://docs.soliditylang.org", desc: "Smart contract programming language reference." },
      { name: "Ethers.js", url: "https://docs.ethers.org", desc: "JavaScript library for Ethereum interaction." },
      { name: "Foundry / Cast", url: "https://book.getfoundry.sh", desc: "Modern EVM development toolkit and CLI." },
      { name: "Kaspa WIKI", url: "https://kas.fyi", desc: "Kaspa protocol docs and node guides." },
      { name: "Solana Web3.js", url: "https://solana-labs.github.io/solana-web3.js", desc: "Solana JavaScript SDK." },
    ],
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    links: [
      { name: "Tails OS", url: "https://tails.net", desc: "Amnesic incognito live operating system." },
      { name: "VirusTotal", url: "https://www.virustotal.com", desc: "Scan files and URLs against dozens of engines." },
      { name: "Shodan", url: "https://www.shodan.io", desc: "Search engine for internet-connected devices." },
      { name: "Have I Been Pwned", url: "https://haveibeenpwned.com", desc: "Check if your email appears in data breaches." },
      { name: "Google Advanced Protection", url: "https://landing.google.com/advancedprotection", desc: "Strongest Google account security for high-risk users." },
    ],
  },
  {
    icon: Terminal,
    title: "Linux & DevOps",
    links: [
      { name: "Ubuntu Documentation", url: "https://help.ubuntu.com", desc: "Official Ubuntu server and desktop guides." },
      { name: "Debian Reference", url: "https://www.debian.org/doc", desc: "Debian system administration manual." },
      { name: "Docker Docs", url: "https://docs.docker.com", desc: "Containerization engine and Compose reference." },
      { name: "systemd man pages", url: "https://www.freedesktop.org/software/systemd/man", desc: "Linux service management reference." },
      { name: "UFW — Uncomplicated Firewall", url: "https://help.ubuntu.com/community/UFW", desc: "Simple firewall configuration for Ubuntu." },
    ],
  },
  {
    icon: Code,
    title: "Developer Tools",
    links: [
      { name: "Base44", url: "https://base44.com", desc: "Backend-as-a-service for building apps fast." },
      { name: "GitHub", url: "https://github.com", desc: "Code hosting, version control, and CI/CD." },
      { name: "Obsidian", url: "https://obsidian.md", desc: "Local-first Markdown knowledge base." },
      { name: "Rufus", url: "https://rufus.ie", desc: "Create bootable USB drives on Windows." },
      { name: "MajorGeeks", url: "https://www.majorgeeks.com", desc: "Trusted source for free Windows software." },
    ],
  },
  {
    icon: BookOpen,
    title: "Learning & Docs",
    links: [
      { name: "Alison", url: "https://alison.com", desc: "Free online courses with certificates." },
      { name: "Bitcoin Core", url: "https://bitcoincore.org", desc: "Reference Bitcoin client and full-node docs." },
      { name: "Monero", url: "https://www.getmonero.org/resources/developer-guides", desc: "Monero developer guides and CLI reference." },
      { name: "IPFS", url: "https://docs.ipfs.tech", desc: "InterPlanetary File System documentation." },
      { name: "OWASP", url: "https://owasp.org", desc: "Open Web Application Security Project resources." },
    ],
  },
];

export default function Resources() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Resources</h1>
          <p className="text-muted-foreground max-w-lg">
            A curated list of Web3 tools, developer websites, and documentation we reference and recommend. All links open in a new tab.
          </p>
        </div>

        <div className="space-y-8">
          {RESOURCE_GROUPS.map((group, gi) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="font-heading font-bold text-lg text-foreground">{group.title}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {group.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card transition-all group"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{link.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{link.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}