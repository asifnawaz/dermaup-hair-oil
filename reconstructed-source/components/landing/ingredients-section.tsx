import Image from "next/image";
import { ChevronDown, FlaskConical } from "lucide-react";

import { getIngredientIconPath } from "../../lib/ingredient-icons";
import {
  localizedBlockText,
  PrimaryLink,
  readBoolean,
  readNumber,
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { ContentSectionProps } from "./types";

export const ingredientColors = [
  "bg-emerald-50",
  "bg-amber-50",
  "bg-rose-50",
  "bg-sky-50",
  "bg-violet-50",
  "bg-lime-50",
  "bg-stone-100",
];

export function IngredientsSection({
  lang,
  contentBlocks = [],
  config,
}: ContentSectionProps) {
  const max = readNumber(config, "maxIngredientItems", 0);
  const items = contentBlocks
    .filter((block) => block.type === "ingredient")
    .map((block) => ({
      id: block.id,
      name: localizedBlockText(block, "name", lang),
      benefit: localizedBlockText(block, "benefit", lang),
      description: localizedBlockText(block, "description", lang),
      evidence: localizedBlockText(block, "evidenceNote", lang),
      icon: readString(block.parsedData.icon, "shield"),
      image: [
        block.parsedData.image,
        block.parsedData.imageSrc,
      ].find(usableImage),
      imageAlt: localizedBlockText(block, "imageAlt", lang, "name"),
    }));
  const visible = max > 0 ? items.slice(0, max) : items;
  const featureImage = readString(config?.featureImage);
  const sprite = readString(config?.ingredientSpriteImage);

  return (
    <SectionShell id="ingredients" tone="cream">
      <div className="grid gap-8 lg:grid-cols-[1.02fr_.98fr] lg:items-start">
        <div>
          {usableImage(featureImage) ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <Image
                alt={readText(config, "featureImageAlt", lang, "Product ingredients")}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                src={featureImage}
              />
            </div>
          ) : usableImage(sprite) ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <Image
                alt={readText(config, "featureTitle", lang, "Ingredient formula")}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                src={sprite}
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-emerald-50">
              <FlaskConical className="h-14 w-14 text-emerald-800" />
            </div>
          )}
          {[1, 2, 3, 4].some((index) => readText(config, `featureChip${index}`, lang)) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 2, 3, 4]
                .map((index) => readText(config, `featureChip${index}`, lang))
                .filter(Boolean)
                .map((chip) => (
                  <span
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
                    key={chip}
                  >
                    {chip}
                  </span>
                ))}
            </div>
          ) : null}
        </div>
        <div>
          <SectionHeading
            centered={false}
            eyebrow={readText(config, "sectionLabel", lang)}
            title={readText(
              config,
              "featureTitle",
              lang,
              readText(config, "headline", lang, "The Ingredients"),
            )}
            subtitle={readText(
              config,
              "featureDescription",
              lang,
              readText(config, "subtitle", lang),
            )}
          />
          <div className="mt-7 divide-y divide-stone-200 border-y border-stone-200">
            {visible.map((item, index) => (
              <details className="group" key={item.id} open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-3 py-4">
                  <span
                    className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                      ingredientColors[index % ingredientColors.length]
                    }`}
                  >
                    {usableImage(item.image) ? (
                      <Image alt={item.imageAlt || item.name} className="object-cover" fill sizes="48px" src={item.image} />
                    ) : (
                      <Image alt="" height={26} src={getIngredientIconPath(item.icon)} width={26} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm text-stone-950">{item.name}</strong>
                    {item.benefit ? (
                      <span className="mt-0.5 block text-xs text-stone-500">{item.benefit}</span>
                    ) : null}
                  </span>
                  <ChevronDown className="h-4 w-4 text-stone-500 transition group-open:rotate-180" />
                </summary>
                {readBoolean(config, "showIngredientDescriptions", true) &&
                (item.description || item.evidence) ? (
                  <div className="pb-4 pl-[60px] text-sm leading-6 text-stone-600">
                    {item.description ? <p>{item.description}</p> : null}
                    {item.evidence ? <p className="mt-2 text-xs italic">{item.evidence}</p> : null}
                  </div>
                ) : null}
              </details>
            ))}
          </div>
          {!visible.length ? (
            <p className="mt-6 rounded-xl bg-white p-5 text-sm leading-6 text-stone-600">
              {readText(config, "guaranteeText", lang, "Full ingredient details are available on the product packaging.")}
            </p>
          ) : null}
          {readBoolean(config, "showIngredientCta", false) &&
          readText(config, "ctaText", lang) ? (
            <PrimaryLink className="mt-7" href={readString(config?.ctaHref, "#hero-product")}>
              {readText(config, "ctaText", lang)}
            </PrimaryLink>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
