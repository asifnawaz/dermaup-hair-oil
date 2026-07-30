import Image from "next/image";

import { readString, readText, usableImage } from "./shared";
import type { BaseSectionProps } from "./types";

export function ArticleBodySection({ lang, config }: BaseSectionProps) {
  const body = readText(config, "body", lang, readText(config, "content", lang));
  const image = readString(config?.image);
  return (
    <article className="bg-white py-12 md:py-20" id={readString(config?.sectionId)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {readText(config, "eyebrow", lang) ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
            {readText(config, "eyebrow", lang)}
          </p>
        ) : null}
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight text-stone-950 md:text-6xl">
          {readText(config, "title", lang, readText(config, "headline", lang, "UpDerma guide"))}
        </h1>
        {readText(config, "subtitle", lang) ? (
          <p className="mt-5 text-lg leading-8 text-stone-600">{readText(config, "subtitle", lang)}</p>
        ) : null}
        {usableImage(image) ? (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
            <Image alt={readText(config, "imageAlt", lang)} className="object-cover" fill sizes="100vw" src={image} />
          </div>
        ) : null}
        {body ? (
          <div
            className="prose prose-stone mt-9 max-w-none text-base leading-8"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : null}
      </div>
    </article>
  );
}
