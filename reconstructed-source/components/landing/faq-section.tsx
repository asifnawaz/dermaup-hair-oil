import { ChevronDown } from "lucide-react";

import {
  localizedBlockText,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { ContentSectionProps } from "./types";

export function FaqSection({
  lang,
  config,
  contentBlocks = [],
}: ContentSectionProps) {
  const faqs = contentBlocks
    .filter((block) => block.type === "faq")
    .map((block) => ({
      id: block.id,
      question:
        localizedBlockText(block, "question", lang, lang === "ur" ? "questionUr" : "questionEn") ||
        localizedBlockText(block, "title", lang),
      answer:
        localizedBlockText(block, "answer", lang, lang === "ur" ? "answerUr" : "answerEn") ||
        localizedBlockText(block, "body", lang),
    }))
    .filter((faq) => faq.question && faq.answer);
  const backgroundImage = readString(config?.backgroundImage);

  return (
    <SectionShell
      id={readString(config?.sectionId, "faq")}
      tone="white"
      className={backgroundImage ? "bg-[linear-gradient(rgba(255,255,255,.94),rgba(255,255,255,.94)),var(--faq-image)]" : ""}
    >
      <SectionHeading
        eyebrow={readText(config, "eyebrow", lang)}
        title={readText(config, "title", lang, readText(config, "headline", lang, "Frequently asked questions"))}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-8 max-w-3xl divide-y divide-stone-200 border-y border-stone-200">
        {faqs.map((faq, index) => (
          <details className="group" key={faq.id} open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold text-stone-950 md:text-base">
              {faq.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-stone-500 transition group-open:rotate-180" />
            </summary>
            <p className="pb-5 text-sm leading-7 text-stone-600">{faq.answer}</p>
          </details>
        ))}
      </div>
      {!faqs.length ? (
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-stone-500">
          {lang === "ur"
            ? "مصنوعات کے سوالات کے لیے واٹس ایپ سپورٹ سے رابطہ کریں۔"
            : "Contact WhatsApp support with any product or routine questions."}
        </p>
      ) : null}
    </SectionShell>
  );
}
