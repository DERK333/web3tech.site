import React from "react";
import { ListTree } from "lucide-react";

// Renders a clickable table of contents that jumps to article sections
export default function TableOfContents({ headings }) {
  if (!headings || headings.length < 3) return null;

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <nav aria-label="Table of contents" className="mb-8 rounded-xl border border-border/50 bg-card/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <ListTree className="w-4 h-4 text-primary" />
        <p className="font-heading font-semibold text-sm text-foreground">Table of Contents</p>
      </div>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-5" : ""}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}