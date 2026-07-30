import { GenericConfiguredSection } from "./shared";
import type { BaseSectionProps } from "./types";

export function ProblemSection(props: BaseSectionProps) {
  return <GenericConfiguredSection {...props} defaultTitle="The problem with one-step promises" tone="cream" />;
}
