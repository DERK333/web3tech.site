import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Button injected into a single rendered <pre> code block.
function CopyButton({ pre }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const code = pre.querySelector("code")?.innerText ?? pre.innerText;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-2 right-2 z-10">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 px-2 text-xs gap-1.5 bg-secondary/80 hover:bg-secondary border border-border/50 select-none"
            >
              {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied to clipboard" : "Copy code"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Finds every <pre> code block inside the post content container and mounts a
// Copy button in its top-right corner via a portal.
export default function CodeBlockCopy({ containerRef, watch }) {
  const [pres, setPres] = useState([]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const found = [...container.querySelectorAll("pre")];
    found.forEach((pre) => {
      pre.style.position = "relative";
    });
    setPres(found);
  }, [containerRef, watch]);

  return pres.map((pre, i) => createPortal(<CopyButton key={i} pre={pre} />, pre));
}