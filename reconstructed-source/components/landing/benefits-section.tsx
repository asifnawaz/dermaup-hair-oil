import {
  localizedBlockText,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { ContentSectionProps } from "./types";

export function BenefitsSection({ lang, config, contentBlocks = [] }: ContentSectionProps) {
  const blocks = contentBlocks.filter((block) => block.type === "benefit");
  return (
    <SectionShell id={readString(config?.sectionId)} tone="cream">
      <SectionHeading
        title={readText(config, "headline", lang, "Benefits that fit a real routine")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block, index) => (
          <article className="rounded-2xl border border-stone-200 bg-white p-5" key={block.id}>
            <span className="text-xs font-bold text-emerald-800">0{index + 1}</span>
            <h3 className="mt-2 text-lg font-semibold text-stone-950">
              {localizedBlockText(block, "title", lang, "name")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {localizedBlockText(block, "description", lang, "benefit")}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
