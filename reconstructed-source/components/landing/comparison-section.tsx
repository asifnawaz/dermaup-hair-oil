import { Check, Minus, X } from "lucide-react";

import {
  localizedBlockText,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { ContentSectionProps } from "./types";

export function ComparisonSection({
  lang,
  config,
  contentBlocks = [],
}: ContentSectionProps) {
  const specialLayout =
    readString(config?.layout) === "qure_vs_list" ||
    readString(config?.variant) === "qure_vs_list";
  const standardBlocks = contentBlocks.filter((block) => block.type === "comparison");
  const columns = specialLayout
    ? [
        {
          title: readText(config, "updermaTitle", lang, readText(config, "productName", lang, "UpDerma")),
          badge: readText(config, "updermaBadge", lang),
          lead: readText(config, "updermaLead", lang),
          points: Array.from({ length: 5 }, (_, index) =>
            readText(config, `updermaPoint${index + 1}`, lang),
          ).filter(Boolean),
          featured: true,
        },
        {
          title: readText(config, "importedTitle", lang, readText(config, "otherName", lang, "Alternatives")),
          badge: readText(config, "importedBadge", lang),
          lead: readText(config, "importedLead", lang),
          points: Array.from({ length: 5 }, (_, index) =>
            readText(config, `importedPoint${index + 1}`, lang),
          ).filter(Boolean),
          featured: false,
        },
      ]
    : [
        {
          title: readText(config, "productName", lang, "UpDerma"),
          points: standardBlocks.map((block) =>
            localizedBlockText(block, "productText", lang, "upderma"),
          ),
          featured: true,
        },
        {
          title: readText(config, "otherName", lang, "Generic alternatives"),
          points: standardBlocks.map((block) =>
            localizedBlockText(block, "otherText", lang, "alternative"),
          ),
          featured: false,
        },
        ...(readText(config, "thirdName", lang)
          ? [
              {
                title: readText(config, "thirdName", lang),
                points: standardBlocks.map((block) =>
                  localizedBlockText(block, "thirdText", lang),
                ),
                featured: false,
              },
            ]
          : []),
      ];

  if (!standardBlocks.length && !specialLayout) {
    const fallbackPoints = [
      lang === "ur" ? "واضح، مسلسل روٹین" : "Clear, repeatable routine",
      lang === "ur" ? "شفاف اجزا" : "Transparent ingredients",
      lang === "ur" ? "استعمال کی رہنمائی" : "Practical use guidance",
      lang === "ur" ? "منی بیک سپورٹ" : "Money-back support",
    ];
    columns[0].points = fallbackPoints;
    columns.slice(1).forEach((column) => {
      column.points = fallbackPoints.map(() => "");
    });
  }

  return (
    <SectionShell id={readString(config?.sectionId, "comparison")} tone="white">
      <SectionHeading
        eyebrow={readText(config, "sectionLabel", lang)}
        title={readText(config, "headline", lang, "How the routines compare")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className={`mx-auto mt-9 grid max-w-5xl gap-3 ${columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {columns.map((column, columnIndex) => (
          <article
            className={`rounded-2xl border p-5 ${
              column.featured
                ? "border-emerald-800 bg-emerald-950 text-white shadow-lg"
                : "border-stone-200 bg-stone-50 text-stone-950"
            }`}
            key={column.title}
          >
            {"badge" in column && column.badge ? (
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                column.featured ? "bg-white/15 text-white" : "bg-stone-200 text-stone-700"
              }`}>
                {column.badge}
              </span>
            ) : null}
            <h3 className="mt-3 min-h-12 text-xl font-semibold leading-tight">{column.title}</h3>
            {"lead" in column && column.lead ? (
              <p className={`mt-2 text-sm leading-6 ${column.featured ? "text-emerald-100" : "text-stone-600"}`}>
                {column.lead}
              </p>
            ) : null}
            <ul className="mt-5 space-y-3">
              {column.points.map((point, index) => (
                <li className="flex gap-2.5 text-sm leading-6" key={`${column.title}-${index}`}>
                  {column.featured ? (
                    <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  ) : point ? (
                    <Minus className="mt-1 h-4 w-4 shrink-0 text-stone-400" />
                  ) : (
                    <X className="mt-1 h-4 w-4 shrink-0 text-stone-400" />
                  )}
                  <span>{point || (lang === "ur" ? "شامل نہیں" : "Not included")}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {readText(config, "footnote", lang) ? (
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-stone-500">
          {readText(config, "footnote", lang)}
        </p>
      ) : null}
    </SectionShell>
  );
}
