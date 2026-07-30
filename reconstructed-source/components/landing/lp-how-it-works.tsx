import {
  localizedBlockText,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { ContentSectionProps } from "./types";

export function LpHowItWorks({ lang, config, contentBlocks = [] }: ContentSectionProps) {
  const steps = contentBlocks.filter((block) => block.type === "how_to_use");
  return (
    <SectionShell id={readString(config?.sectionId)} tone="white">
      <SectionHeading
        title={readText(config, "headline", lang, "How it works")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <ol className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li className="rounded-2xl border border-stone-200 p-5" key={step.id}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-950 text-xs font-bold text-white">
              {index + 1}
            </span>
            <h3 className="mt-4 font-semibold text-stone-950">
              {localizedBlockText(step, "title", lang, "name")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {localizedBlockText(step, "description", lang, "body")}
            </p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
