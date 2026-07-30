import Image from "next/image";

import {
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { BaseSectionProps } from "./types";

export function BeforeAfterSection({ lang, config }: BaseSectionProps) {
  const beforeLabel = readText(config, "beforeLabel", lang, "Before");
  const afterLabel = readText(config, "afterLabel", lang, "After");
  const pairs = Array.from({ length: 4 }, (_, index) => {
    const number = index + 1;
    return {
      before: readString(config?.[`pair${number}BeforeImage`]),
      after: readString(config?.[`pair${number}AfterImage`]),
      beforeAlt: readText(config, `pair${number}BeforeImageAlt`, lang),
      afterAlt: readText(config, `pair${number}AfterImageAlt`, lang),
      title: readText(config, `pair${number}Title`, lang),
      duration: readText(config, `pair${number}Duration`, lang),
      description: readText(config, `pair${number}Description`, lang),
      badge: readText(config, `pair${number}Badge`, lang),
    };
  }).filter((pair) => usableImage(pair.before) || usableImage(pair.after));

  return (
    <SectionShell id={readString(config?.sectionId)} tone="white">
      <SectionHeading
        eyebrow={readText(config, "sectionLabel", lang)}
        title={readText(config, "headline", lang, "Before and after")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {pairs.map((pair, index) => (
          <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white" key={index}>
            <div className="grid grid-cols-2">
              {[["before", pair.before, pair.beforeAlt, beforeLabel], ["after", pair.after, pair.afterAlt, afterLabel]].map(
                ([key, image, alt, label]) => (
                  <div className="relative aspect-[4/5] bg-stone-100" key={key}>
                    {usableImage(image) ? (
                      <Image alt={alt || pair.title} className="object-cover" fill sizes="50vw" src={image} />
                    ) : null}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
            <div className="p-5">
              {pair.badge ? (
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                  {pair.badge}
                </span>
              ) : null}
              <h3 className="mt-1 text-lg font-semibold text-stone-950">{pair.title}</h3>
              {pair.duration ? <p className="mt-1 text-xs font-medium text-stone-500">{pair.duration}</p> : null}
              {pair.description ? <p className="mt-3 text-sm leading-6 text-stone-600">{pair.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
      {readText(config, "disclaimer", lang) ? (
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-stone-500">
          {readText(config, "disclaimer", lang)}
        </p>
      ) : null}
    </SectionShell>
  );
}
