import Image from "next/image";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";

import {
  PrimaryLink,
  readNumber,
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { BaseSectionProps } from "./types";

export function GuaranteeSection({ lang, config }: BaseSectionProps) {
  const image = readString(config?.featureImage);
  const badges = [1, 2, 3]
    .map((index) => readText(config, `badge${index}`, lang))
    .filter(Boolean);
  const icons = [ShieldCheck, Truck, MessageCircle];

  return (
    <SectionShell id={readString(config?.sectionId, "guarantee")} tone="cream">
      <div className={`mx-auto grid max-w-5xl items-center gap-8 ${usableImage(image) ? "md:grid-cols-[.8fr_1.2fr]" : ""}`}>
        {usableImage(image) ? (
          <div
            className="relative overflow-hidden rounded-2xl bg-stone-100"
            style={{ aspectRatio: readString(config?.featureAspect, "4 / 3") }}
          >
            <Image
              alt={readText(config, "featureImageAlt", lang, "UpDerma guarantee")}
              className={readString(config?.featureObjectFit, "cover") === "contain" ? "object-contain" : "object-cover"}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              src={image}
            />
          </div>
        ) : null}
        <div>
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950 text-white">
            <span className="text-lg font-bold">{readNumber(config, "days", 90)}</span>
          </div>
          <SectionHeading
            centered={false}
            eyebrow={readText(config, "eyebrow", lang, "90-day money-back guarantee")}
            title={readText(config, "headline", lang, "Start the routine. Risk-free.")}
            subtitle={readText(config, "description", lang)}
          />
          {badges.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {badges.map((badge, index) => {
                const Icon = icons[index] || ShieldCheck;
                return (
                  <div className="rounded-xl border border-stone-200 bg-white p-4 text-center" key={badge}>
                    <Icon className="mx-auto h-5 w-5 text-emerald-800" />
                    <p className="mt-2 text-xs font-semibold text-stone-700">{badge}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
          <PrimaryLink className="mt-7" href={readString(config?.ctaHref, "#hero-product")}>
            {readText(config, "ctaText", lang, lang === "ur" ? "اپنی روٹین شروع کریں" : "Start My Routine")}
          </PrimaryLink>
        </div>
      </div>
    </SectionShell>
  );
}
