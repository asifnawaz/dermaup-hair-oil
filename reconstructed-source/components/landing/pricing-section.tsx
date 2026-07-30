"use client";

import { Check } from "lucide-react";

import { formatPrice, readString, readText, SectionHeading, SectionShell } from "./shared";
import type { BaseSectionProps, ProductPackage } from "./types";

export type PricingSectionProps = BaseSectionProps & {
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
  packages: Record<string, ProductPackage>;
};

export function PricingSection({
  lang,
  selectedPackage,
  onSelectPackage,
  packages,
  config,
}: PricingSectionProps) {
  const items = Object.entries(packages || {}).filter(([, item]) => item.hidden !== true);
  return (
    <SectionShell id={readString(config?.sectionId, "pricing")} tone="cream">
      <SectionHeading
        title={readText(config, "headline", lang, "Choose your routine")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {items.map(([id, item]) => {
          const selected = id === selectedPackage;
          return (
            <button
              className={`relative rounded-2xl border p-6 text-start ${
                selected ? "border-emerald-900 bg-white ring-2 ring-emerald-900" : "border-stone-200 bg-white"
              }`}
              key={id}
              onClick={() => onSelectPackage(id)}
              type="button"
            >
              {item.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-950 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {lang === "ur" ? "مقبول" : "Most popular"}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-stone-950">
                {lang === "ur" && item.nameUr ? item.nameUr : item.name || id}
              </h3>
              <p className="mt-3 text-2xl font-bold text-emerald-950">{formatPrice(Number(item.price))}</p>
              {item.originalPrice && Number(item.originalPrice) > Number(item.price) ? (
                <p className="mt-1 text-sm text-stone-400 line-through">{formatPrice(Number(item.originalPrice))}</p>
              ) : null}
              <span className={`mt-5 inline-flex h-7 w-7 items-center justify-center rounded-full ${
                selected ? "bg-emerald-950 text-white" : "bg-stone-100 text-stone-400"
              }`}>
                <Check className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}
