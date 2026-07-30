import Image from "next/image";
import { Quote } from "lucide-react";

import {
  readString,
  readText,
  SectionHeading,
  SectionShell,
  usableImage,
} from "./shared";
import type { BaseSectionProps } from "./types";

export function ClinicalStatsSection({ lang, config }: BaseSectionProps) {
  const background = readString(config?.backgroundImage);
  const stats = [1, 2]
    .map((index) => ({
      value: readText(config, `stat${index}Value`, lang),
      label: readText(config, `stat${index}Label`, lang),
    }))
    .filter((stat) => stat.value || stat.label);

  return (
    <SectionShell id={readString(config?.sectionId)} tone="dark" className="relative overflow-hidden">
      {usableImage(background) ? (
        <Image
          alt={readText(config, "backgroundImageAlt", lang)}
          className="object-cover opacity-25"
          fill
          sizes="100vw"
          src={background}
        />
      ) : null}
      <div className="relative grid gap-8 md:grid-cols-[1.15fr_.85fr] md:items-center">
        <div>
          <SectionHeading
            centered={false}
            inverted
            title={readText(config, "title", lang, "Clinical perspective")}
            subtitle={readText(config, "body", lang)}
          />
          {readText(config, "quote", lang) ? (
            <blockquote className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 text-sm leading-7 text-stone-100 backdrop-blur">
              <Quote className="mb-3 h-6 w-6 text-emerald-300" />
              “{readText(config, "quote", lang)}”
              {readText(config, "doctorName", lang) ? (
                <footer className="mt-3 font-semibold text-white">
                  {readText(config, "doctorName", lang)}
                </footer>
              ) : null}
            </blockquote>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div className="rounded-2xl bg-white p-5 text-center text-stone-950" key={stat.label}>
              <strong className="block text-3xl font-semibold text-emerald-950 md:text-5xl">{stat.value}</strong>
              <span className="mt-2 block text-xs leading-5 text-stone-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
