import { ResultsTimelineSection } from "./results-timeline-section";
import type { ContentSectionProps } from "./types";

export function LpResults({ lang, config }: ContentSectionProps) {
  return <ResultsTimelineSection config={config} lang={lang} />;
}
