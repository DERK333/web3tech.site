import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALL_RESOURCES } from "@/lib/resourceData";
import RelatedResourcePosts from "@/components/blog/RelatedResourcePosts";

export default function ResourceDetail() {
  const { slug } = useParams();
  const resource = ALL_RESOURCES.find((r) => r.slug === slug);
  const Icon = resource?.icon;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Unique meta title + description per tool (same pattern as BlogPost)
  useEffect(() => {
    if (!resource) return;
    document.title = `${resource.name} — TheWeb3Tech`;
    const desc = document.querySelector("meta[name='description']");
    if (desc) desc.setAttribute("content", resource.usage);
  }, [resource]);

  if (!resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Resource not found</h1>
        <p className="text-sm text-muted-foreground">This tool isn't in our resource library.</p>
        <Link to="/resources" className="text-primary hover:underline flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/resources" className="hover:text-primary transition-colors">Resources</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[220px]">{resource.name}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground mb-1.5">{resource.group}</Badge>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground leading-tight">{resource.name}</h1>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground leading-relaxed mb-8">{resource.desc}</p>

        {/* How we use it */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-5 mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <Wrench className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">How we use it</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{resource.usage}</p>
        </div>

        {/* Official documentation */}
        <div className="mb-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary select-none"
          >
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Official Documentation
            </a>
          </Button>
        </div>

        {/* Related tutorials */}
        <RelatedResourcePosts resource={resource} />

        <div className="mt-10 pt-6 border-t border-border">
          <Link to="/resources" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all resources
          </Link>
        </div>
      </motion.div>
    </div>
  );
}