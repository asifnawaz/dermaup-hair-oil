import Image from "next/image";

import {
  readBoolean,
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { BaseSectionProps } from "./types";

export function ResultsTimelineSection({ lang, config }: BaseSectionProps) {
  const cards = Array.from({ length: 6 }, (_, index) => {
    const number = index + 1;
    return {
      image: readString(config?.[`card${number}Image`]),
      imageAlt: readText(config, `card${number}ImageAlt`, lang),
      name: readText(config, `card${number}Name`, lang),
      meta: readText(config, `card${number}Meta`, lang),
      quote: readText(config, `card${number}Quote`, lang),
      period: readText(config, `step${number}Period`, lang),
      title: readText(config, `step${number}Title`, lang),
      text: readText(config, `step${number}Text`, lang),
    };
  }).filter((item) => item.title || item.image || item.quote);
  const hideImages = readBoolean(config, "hideImages", false);

  return (
    <SectionShell id={readString(config?.sectionId, "results")} tone="cream">
      <SectionHeading
        eyebrow={readText(config, "sectionLabel", lang)}
        title={readText(config, "headline", lang, "Results that follow a routine")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div
        className={`mt-9 grid gap-4 ${
          cards.length > 3 ? "md:grid-cols-3" : "md:grid-cols-3"
        }`}
      >
        {cards.map((item, index) => (
          <article
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            key={`${item.name}-${item.title}-${index}`}
          >
            {!hideImages && usableImage(item.image) ? (
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image
                  alt={item.imageAlt || item.name || item.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={item.image}
                />
              </div>
            ) : null}
            <div className="p-5">
              {item.period ? (
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                  {item.period}
                </p>
              ) : null}
              {item.title ? (
                <h3 className="mt-2 text-lg font-semibold text-stone-950">{item.title}</h3>
              ) : null}
              {item.text ? (
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
              ) : null}
              {item.quote ? (
                <blockquote className="mt-4 border-l-2 border-emerald-700 pl-3 text-sm italic leading-6 text-stone-600">
                  “{item.quote}”
                </blockquote>
              ) : null}
              {item.name ? (
                <p className="mt-4 text-sm font-semibold text-stone-900">{item.name}</p>
              ) : null}
              {item.meta ? <p className="text-xs text-stone-500">{item.meta}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
