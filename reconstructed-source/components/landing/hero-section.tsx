import Image from "next/image";

import {
  PrimaryLink,
  readString,
  readText,
  usableImage,
} from "./shared";
import type { BaseSectionProps } from "./types";

export function HeroSection({ lang, config }: BaseSectionProps) {
  const image = [config?.image, config?.heroImage, config?.backgroundImage].find(usableImage);
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#F8F6F1] py-16 md:py-24">
      {usableImage(image) ? (
        <Image alt="" className="object-cover opacity-20" fill priority sizes="100vw" src={image} />
      ) : null}
      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
          {readText(config, "eyebrow", lang)}
        </p>
        <h1 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-semibold leading-[1.04] tracking-tight text-stone-950 md:text-7xl">
          {readText(config, "headline", lang, readText(config, "title", lang, "A routine built for consistency"))}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
          {readText(config, "subtitle", lang)}
        </p>
        {readText(config, "ctaText", lang) ? (
          <PrimaryLink className="mt-7" href={readString(config?.ctaHref, "#pricing")}>
            {readText(config, "ctaText", lang)}
          </PrimaryLink>
        ) : null}
      </div>
    </section>
  );
}
