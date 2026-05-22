"use client";

import { useState } from "react";
import { shouldClampSynopsis } from "@/lib/anime/detail";

// Renders an anime synopsis, clamping to ~4 lines with a Show more/less toggle
// only when the text is long enough to need it (see shouldClampSynopsis).
export function Synopsis({ text, className = "" }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!shouldClampSynopsis(text)) {
    return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
  }

  return (
    <div className={className}>
      <p className={`whitespace-pre-line ${expanded ? "" : "line-clamp-4"}`}>{text}</p>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-1 cursor-pointer text-sm font-medium text-amber-400 hover:text-amber-300"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
