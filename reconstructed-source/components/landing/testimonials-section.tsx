"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BadgeCheck } from "lucide-react";

import { getInitials } from "../../lib/utils";
import {
  localizedBlockText,
  readBoolean,
  readString,
  readText,
  SectionHeading,
  SectionShell,
  Stars,
  usableImage,
} from "./shared";
import type { ContentSectionProps } from "./types";

export function getReviewTags(
  block: ContentSectionProps["contentBlocks"] extends (infer T)[] | undefined ? T : never,
): string[] {
  if (!block) return [];
  const value = block.parsedData.tags;
  if (Array.isArray(value)) return value.map(String);
  return readString(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function TestimonialsSection({
  lang,
  contentBlocks = [],
  config,
}: ContentSectionProps) {
  const blocks = contentBlocks.filter((block) => block.type === "testimonial");
  const filterLabels = [
    readText(config, "filterAllLabel", lang, readText(config, "filter1Label", lang, lang === "ur" ? "سب" : "All")),
    readText(config, "filter1Label", lang),
    readText(config, "filter2Label", lang),
    readText(config, "filter3Label", lang),
    readText(config, "filter4Label", lang),
    readText(config, "filter5Label", lang),
  ].filter((label, index, array) => label && array.indexOf(label) === index);
  const [activeFilter, setActiveFilter] = useState(filterLabels[0] || "");
  const filtered = useMemo(() => {
    if (!activeFilter || activeFilter === filterLabels[0]) return blocks;
    const query = activeFilter.toLowerCase();
    return blocks.filter((block) => {
      const haystack = [
        localizedBlockText(block, "text", lang, "textEn"),
        localizedBlockText(block, "title", lang),
        ...getReviewTags(block),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeFilter, blocks, filterLabels, lang]);

  return (
    <SectionShell id={readString(config?.sectionId, "reviews")} tone="cream">
      <SectionHeading
        eyebrow={readText(config, "eyebrow", lang)}
        title={readText(config, "title", lang, readText(config, "headline", lang, "Real customer routines"))}
        subtitle={readText(config, "subtitle", lang)}
      />
      {readBoolean(config, "enableFilterChips", filterLabels.length > 1) && filterLabels.length > 1 ? (
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {filterLabels.map((label) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                label === activeFilter
                  ? "bg-stone-950 text-white"
                  : "border border-stone-200 bg-white text-stone-700"
              }`}
              key={label}
              onClick={() => setActiveFilter(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-9 flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
        {filtered.map((block) => {
          const name = localizedBlockText(block, "name", lang);
          const city = localizedBlockText(block, "city", lang);
          const text =
            localizedBlockText(block, "text", lang, "textEn") ||
            localizedBlockText(block, "quote", lang);
          const image = [
            block.parsedData.image,
            block.parsedData.imageUrl,
            block.parsedData.avatar,
          ].find(usableImage);
          const rating = Number(block.parsedData.rating) || 5;

          return (
            <article
              className="min-w-[82%] snap-start rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:min-w-[48%] md:min-w-0"
              key={block.id}
            >
              {usableImage(image) ? (
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
                  <Image alt={name || "Customer review"} className="object-cover" fill sizes="33vw" src={image} />
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <Stars rating={rating} />
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <BadgeCheck className="h-4 w-4" />
                  {readText(config, "verifiedBadgeText", lang, "Verified")}
                </span>
              </div>
              <blockquote className="mt-4 text-sm leading-7 text-stone-700">
                “{text}”
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                {!image ? (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-900">
                    {getInitials(name || "UpDerma")}
                  </span>
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-stone-950">{name}</p>
                  {city ? <p className="text-xs text-stone-500">{city}</p> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!filtered.length ? (
        <p className="mt-8 text-center text-sm text-stone-500">
          {readText(config, "emptyFilterText", lang, lang === "ur" ? "اس فلٹر کے لیے کوئی جائزہ نہیں ملا۔" : "No reviews match this filter.")}
        </p>
      ) : null}
    </SectionShell>
  );
}
