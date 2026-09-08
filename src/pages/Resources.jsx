import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RESOURCE_GROUPS } from "@/lib/resourceData";

export default function Resources() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Resources</h1>
          <p className="text-muted-foreground max-w-lg">
            A curated list of Web3 tools, developer websites, and documentation we reference and recommend. Click any tool to see how we use it and find related tutorials.
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
                  {group.links.map((link, i) => (
                    <Link
                      key={`${link.slug}-${i}`}
                      to={`/resources/${link.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card transition-all group"
                    >
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{link.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{link.desc}</p>
                      </div>
                    </Link>
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