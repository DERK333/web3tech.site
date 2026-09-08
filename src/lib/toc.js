// Table of contents helpers — shared by BlogPost.jsx and TableOfContents.jsx

// Convert heading text into a URL-safe anchor id
export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[`*_~]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Extract H2/H3 headings from markdown (skips fenced code blocks)
export function extractHeadings(markdown) {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings = [];
  const used = new Map();
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    // Flatten markdown links to their text
    const text = match[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
    let id = slugifyHeading(text);
    const count = used.get(id) || 0;
    used.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    headings.push({ level: match[1].length, text, id });
  }
  return headings;
}

// Derive an anchor id from a rendered heading's children (strings / elements)
// so ReactMarkdown headings get the same ids as the extracted TOC entries.
export function headingIdFromChildren(children) {
  const text = (Array.isArray(children) ? children : [children])
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (child && typeof child === "object" && child.props && child.props.children) {
        return headingIdFromChildren(child.props.children);
      }
      return "";
    })
    .join("");
  return slugifyHeading(text);
}