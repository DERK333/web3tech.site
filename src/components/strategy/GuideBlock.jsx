import React from "react";

export default function GuideBlock({ number, title, icon: Icon, id, children }) {
  return (
    <section id={id} className="mt-5 scroll-mt-24 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {number}
          </p>
          <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">{title}</h2>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}