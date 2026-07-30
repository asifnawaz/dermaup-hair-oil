import { GenericConfiguredSection } from "./shared";
import type { BaseSectionProps } from "./types";

export function FinalCtaSection(props: BaseSectionProps) {
  return <GenericConfiguredSection {...props} defaultTitle="Ready to start your routine?" tone="dark" />;
}
