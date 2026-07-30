import { BadgeCheck } from "lucide-react";

import { localizedBlockText, readText } from "./shared";
import type { ContentSectionProps } from "./types";

export function SocialProofBar({ lang, config, contentBlocks = [] }: ContentSectionProps) {
  const items = contentBlocks
    .filter((block) => block.type === "social_proof")
    .map((block) => localizedBlockText(block, "text", lang, "title"))
    .filter(Boolean);
  if (!items.length) {
    items.push(readText(config, "text", lang, "Trusted routines. Transparent ingredients. Clear support."));
  }
  return (
    <aside className="border-y border-stone-200 bg-white py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-3 px-4">
        {items.map((item) => (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700" key={item}>
            <BadgeCheck className="h-4 w-4 text-emerald-800" />
            {item}
          </span>
        ))}
      </div>
    </aside>
  );
}
