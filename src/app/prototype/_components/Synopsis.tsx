"use client";

// PROTOTYPE — collapsible synopsis (agreed: collapse long synopses).
import { useState } from "react";

export function Synopsis({ text, className = "" }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <p className={open ? "" : "line-clamp-3"}>{text}</p>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-1 text-sm font-medium text-amber-400 hover:text-amber-300"
      >
        {open ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
