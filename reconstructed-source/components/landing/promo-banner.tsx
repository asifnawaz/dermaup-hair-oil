import { readText } from "./shared";
import type { BaseSectionProps } from "./types";

export function PromoBanner({ lang, config }: BaseSectionProps) {
  const text = readText(config, "text", lang, readText(config, "headline", lang));
  if (!text) return null;
  return (
    <aside className="border-y border-emerald-900 bg-emerald-950 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white">
      {text}
    </aside>
  );
}
