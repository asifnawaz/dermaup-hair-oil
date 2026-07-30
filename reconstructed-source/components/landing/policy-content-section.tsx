import { Check } from "lucide-react";

import { readString, readText } from "./shared";
import type { BaseSectionProps, LandingConfig } from "./types";

type PolicyBlock = {
  title?: string;
  body?: string;
  bullets?: string[];
};

function readBlocks(config: LandingConfig | null | undefined, key: string): PolicyBlock[] {
  const value = config?.[key];
  return Array.isArray(value)
    ? value.filter((item): item is PolicyBlock => Boolean(item && typeof item === "object"))
    : [];
}

export function PolicyContentSection({ lang, config }: BaseSectionProps) {
  const blocks = readBlocks(config, lang === "ur" ? "blocksUr" : "blocks");
  const fallback = blocks.length ? blocks : readBlocks(config, "blocks");

  return (
    <section className="bg-white py-12 md:py-20" id={readString(config?.sectionId)}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="border-b border-stone-200 pb-8">
          {readText(config, "eyebrow", lang) ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
              {readText(config, "eyebrow", lang)}
            </p>
          ) : null}
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
            {readText(config, "title", lang, "Policy")}
          </h1>
          {readText(config, "summary", lang) ? (
            <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600">
              {readText(config, "summary", lang)}
            </p>
          ) : null}
          {readText(config, "lastUpdated", lang) ? (
            <p className="mt-4 text-xs font-medium text-stone-500">
              {lang === "ur" ? "آخری اپ ڈیٹ: " : "Last updated: "}
              {readText(config, "lastUpdated", lang)}
            </p>
          ) : null}
        </header>
        <div className="divide-y divide-stone-200">
          {fallback.map((block, index) => (
            <article className="py-8" key={`${block.title}-${index}`}>
              {block.title ? (
                <h2 className="text-2xl font-semibold text-stone-950">{block.title}</h2>
              ) : null}
              {block.body ? (
                <p className="mt-3 text-sm leading-7 text-stone-600">{block.body}</p>
              ) : null}
              {block.bullets?.length ? (
                <ul className="mt-5 space-y-2">
                  {block.bullets.map((bullet) => (
                    <li className="flex gap-3 text-sm leading-6 text-stone-600" key={bullet}>
                      <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-800" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
