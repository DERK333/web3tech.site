import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is the Web3 Insights Hub?",
    a: "The Web3 Insights Hub — TheWeb3Tech — is a publication for developers and tech enthusiasts covering Web3, blockchain, Linux, cybersecurity, and decentralized tooling. Every article is a practical, real-world guide written to be immediately useful, not just theoretical.",
  },
  {
    q: "What topics do you cover?",
    a: "We cover five core categories: Blockchain (smart contracts, Ethereum, Kaspa, Monero, Docker-based node setups), Security (TailsOS, phishing defense, hardening), Linux (Ubuntu, Debian, Docker, system administration), Privacy (Tor, Tails, operational security), and Software (trusted tools, Windows utilities, developer productivity).",
  },
  {
    q: "What is your technology stack?",
    a: "The site is built on React with Tailwind CSS for the frontend, served via the Base44 platform (backend-as-a-service) which handles authentication, the database, and serverless functions. Content is stored as Markdown-based modules. We expose an RSS feed and an XML sitemap for syndication and search indexing.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. All articles are free to read without an account. Creating an account lets you join the conversation via comments and access the in-app AI assistant. Accounts are optional and never required to read content.",
  },
  {
    q: "What is your content policy?",
    a: "We publish original, practical guides. We do not republish press releases, paid promotions, or AI-generated filler. Every post is written by Derrk Samuel and reviewed for technical accuracy. Sponsored content, if ever introduced, will be clearly labeled.",
  },
  {
    q: "Can I subscribe to updates?",
    a: "Yes. Use the /subscribe page to join our email list — you'll get notified whenever a new article drops. We also offer an RSS feed at /api/rssFeed for feed readers. We never sell or share your email.",
  },
  {
    q: "How often do you publish?",
    a: "New articles are published regularly — typically several per week. The Archive page (/archive) shows the full chronological history, and the RSS feed and sitemap are updated automatically on each publish.",
  },
  {
    q: "Can I use your code examples in my own projects?",
    a: "Absolutely. Code snippets in our tutorials are provided for you to use, adapt, and learn from. Attribution is appreciated but not required. Please review any linked third-party licenses (for tools, libraries, and clients) before using those in production.",
  },
  {
    q: "How do I report an error or suggest a topic?",
    a: "Use the Contact page to reach out. We welcome corrections — technical accuracy matters — and reader topic suggestions often shape what we write next.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <span className="font-heading font-semibold text-sm text-foreground pr-4">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <HelpCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to know about the Web3 Insights Hub, how we work, and what to expect.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}