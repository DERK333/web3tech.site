import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Blockchain Developer",
    text: "The Docker + Ethereum node guide saved me hours of trial and error. Clear, correct, and actually runnable. This is the kind of documentation the Web3 space desperately needs.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Security Engineer",
    text: "I recommend the TailsOS and operational security articles to everyone on my team. The walkthroughs are practical without dumbing things down — rare combo.",
    rating: 5,
  },
  {
    name: "Diego R.",
    role: "Linux Sysadmin",
    text: "The Ubuntu and Docker tutorials are the first place I check when I hit a wall. The command-line guides are copy-paste ready and the explanations actually teach you why.",
    rating: 5,
  },
  {
    name: "Aisha K.",
    role: "Crypto Enthusiast",
    text: "The CLI crypto guide finally made sending from the terminal click for me. Covered Bitcoin, Monero, and Kaspa all in one place — exactly what I needed.",
    rating: 5,
  },
  {
    name: "Tom B.",
    role: "DevOps Lead",
    text: "We use the systemd and Docker Compose articles as onboarding material for new engineers. Consistently high quality and always up to date.",
    rating: 5,
  },
  {
    name: "Nina V.",
    role: "Privacy Advocate",
    text: "The privacy and TailsOS content is genuinely useful and not fear-mongering. It respects the reader's intelligence and gives actionable steps.",
    rating: 5,
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <Quote className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Reader Testimonials</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Feedback from developers, sysadmins, and tech enthusiasts who read TheWeb3Tech.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/50 p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/15" />
              <Stars count={t.rating} />
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}