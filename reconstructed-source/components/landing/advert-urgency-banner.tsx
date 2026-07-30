import { Clock3 } from "lucide-react";

import { readText } from "./shared";
import type { BaseSectionProps } from "./types";

export function AdvertUrgencyBanner({ lang, config }: BaseSectionProps) {
  return (
    <aside className="border-y border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-950">
      <Clock3 className="mr-2 inline h-4 w-4" />
      {readText(config, "text", lang, readText(config, "headline", lang, "Limited small-batch availability"))}
    </aside>
  );
}
