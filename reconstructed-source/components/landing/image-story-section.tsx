"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import {
  ConfiguredItems,
  PrimaryLink,
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { BaseSectionProps, ParsedContentBlock, ParsedProduct } from "./types";

export type ImageStorySectionProps = BaseSectionProps & {
  contentBlocks?: ParsedContentBlock[];
  product?: ParsedProduct | null;
  allProducts?: ParsedProduct[];
};

function CompareSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  alt,
}: {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative mx-auto mt-8 aspect-[4/3] max-w-3xl overflow-hidden rounded-2xl bg-stone-100 shadow-lg">
      <Image alt={alt} className="object-cover" fill sizes="100vw" src={afterImage} />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div className="relative h-full" style={{ width: `${10000 / position}%` }}>
          <Image
            alt={alt}
            className="object-cover object-left"
            fill
            sizes="100vw"
            src={beforeImage}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-950 shadow">
          <ChevronLeft className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
        {beforeLabel}
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
        {afterLabel}
      </span>
      <input
        aria-label="Compare before and after images"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        max={100}
        min={0}
        onChange={(event) => setPosition(Number(event.target.value))}
        type="range"
        value={position}
      />
    </div>
  );
}

export function ImageStorySection({
  lang,
  config,
}: ImageStorySectionProps) {
  const layout = readString(config?.layout);
  const id = readString(config?.sectionId);
  const title = readText(config, "headline", lang, "The routine, explained");
  const subtitle = readText(config, "subtitle", lang);
  const eyebrow = readText(config, "sectionLabel", lang);

  if (layout === "image_compare_slider") {
    const beforeImage = readString(config?.beforeImage);
    const afterImage = readString(config?.afterImage);
    return (
      <SectionShell id={id || undefined} tone="cream">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {usableImage(beforeImage) && usableImage(afterImage) ? (
          <CompareSlider
            afterImage={afterImage}
            afterLabel={readText(config, "afterLabel", lang, "After")}
            alt={readText(config, "backgroundImageAlt", lang, title)}
            beforeImage={beforeImage}
            beforeLabel={readText(config, "beforeLabel", lang, "Before")}
          />
        ) : null}
      </SectionShell>
    );
  }

  if (layout === "apply_steps_grid") {
    return (
      <SectionShell id={id || undefined} tone="cream">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <ConfiguredItems
          className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          config={config}
          count={4}
          lang={lang}
        />
      </SectionShell>
    );
  }

  if (layout === "qure_active_card") {
    const featureImage = readString(config?.featureImage);
    const backgroundImage = readString(config?.backgroundImage);
    const ingredients = [1, 2, 3]
      .map((index) => readText(config, `item${index}Title`, lang))
      .filter(Boolean);

    return (
      <SectionShell id={id || undefined} tone="dark" className="relative overflow-hidden">
        {usableImage(backgroundImage) ? (
          <Image
            alt=""
            className="object-cover opacity-20"
            fill
            sizes="100vw"
            src={backgroundImage}
          />
        ) : null}
        <div className="relative grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div>
            {eyebrow ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-serif text-3xl font-semibold leading-tight md:text-5xl">
              {title}
            </h2>
            {subtitle ? <p className="mt-4 leading-7 text-stone-300">{subtitle}</p> : null}
            <ul className="mt-6 space-y-3">
              {ingredients.map((ingredient) => (
                <li className="flex items-center gap-3 text-sm text-stone-100" key={ingredient}>
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          {usableImage(featureImage) ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900">
              <Image
                alt={readText(config, "featureImageAlt", lang, title)}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={featureImage}
              />
            </div>
          ) : null}
        </div>
      </SectionShell>
    );
  }

  const featureImage = [
    config?.featureImage,
    config?.item1Image,
    config?.backgroundImage,
  ].find(usableImage);
  const paragraphs = [1, 2, 3]
    .map((index) => readText(config, `paragraph${index}`, lang))
    .filter(Boolean);
  const items = [1, 2, 3, 4, 5]
    .map((index) => ({
      title: readText(config, `item${index}Title`, lang),
      description: readText(config, `item${index}Description`, lang),
    }))
    .filter((item) => item.title || item.description);

  return (
    <SectionShell id={id || undefined} tone="white">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <div className={readString(config?.visualFirst) === "false" ? "md:order-2" : ""}>
          {usableImage(featureImage) ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
              <Image
                alt={readText(config, "featureImageAlt", lang, title)}
                className={
                  readString(config?.featureObjectFit, "cover") === "contain"
                    ? "object-contain p-5"
                    : "object-cover"
                }
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={featureImage}
              />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-50 to-stone-200" />
          )}
        </div>
        <div>
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-serif text-3xl font-semibold leading-[1.08] tracking-tight text-stone-950 md:text-5xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-4 text-base leading-7 text-stone-600">{subtitle}</p> : null}
          {paragraphs.map((paragraph) => (
            <p className="mt-4 text-sm leading-7 text-stone-600" key={paragraph}>
              {paragraph}
            </p>
          ))}
          {items.length ? (
            <ul className="mt-6 grid gap-3">
              {items.map((item) => (
                <li className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={item.title}>
                  <div className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <Check className="h-4 w-4" />
                    </span>
                    <div>
                      {item.title ? (
                        <h3 className="font-semibold text-stone-950">{item.title}</h3>
                      ) : null}
                      {item.description ? (
                        <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {readText(config, "ctaText", lang) ? (
            <PrimaryLink
              className="mt-7"
              href={readString(config?.ctaHref, "#hero-product")}
            >
              {readText(config, "ctaText", lang)}
            </PrimaryLink>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
