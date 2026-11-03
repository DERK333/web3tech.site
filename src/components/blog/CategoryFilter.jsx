import React from "react";
import { CATEGORIES } from "@/lib/blogData";

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onCategoryChange(cat.name)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-11 ${
            activeCategory === cat.name
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {cat.name}
          <span className="ml-1.5 opacity-60">{cat.count}</span>
        </button>
      ))}
    </div>
  );
}