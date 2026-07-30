import { GenericConfiguredSection } from "./shared";
import type { BaseSectionProps } from "./types";

export function SolutionSection(props: BaseSectionProps) {
  return <GenericConfiguredSection {...props} defaultTitle="A simpler, more consistent solution" tone="white" />;
}
