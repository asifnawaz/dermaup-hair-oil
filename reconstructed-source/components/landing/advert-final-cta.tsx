import { GenericConfiguredSection } from "./shared";
import type { BaseSectionProps } from "./types";

export function AdvertFinalCta(props: BaseSectionProps) {
  return <GenericConfiguredSection {...props} defaultTitle="Start your routine today" tone="dark" />;
}
