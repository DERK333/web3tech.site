import React from "react";

// Hidden anti-spam honeypot: invisible to real users, but naive spam
// scripts auto-fill every input they find. The backend silently drops
// any request where this field is non-empty.
export default function HoneypotField({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
      <label htmlFor="company_website">Company website</label>
      <input
        id="company_website"
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}