import type { Language } from "./constants";
import { t } from "./i18n";

export type TrustProofId =
  | "results"
  | "dermatologist"
  | "payment"
  | "guarantee";
export type TrustIconName = TrustProofId;
export type TrustProofTone = TrustProofId;

export interface TrustProofItem {
  id: TrustProofId;
  icon: TrustIconName;
  tone: TrustProofTone;
  text: string;
}

const TRUST_PROOF_SPECS = [
  {
    id: "results",
    icon: "results",
    tone: "results",
    textKey: "product.guarantees.resultsSeen",
    configKey: "trustItemResults",
  },
  {
    id: "dermatologist",
    icon: "dermatologist",
    tone: "dermatologist",
    textKey: "product.guarantees.dermApproved",
    configKey: "trustItem2",
  },
  {
    id: "payment",
    icon: "payment",
    tone: "payment",
    textKey: "product.guarantees.nationwide",
    configKey: "trustItem1",
  },
  {
    id: "guarantee",
    icon: "guarantee",
    tone: "guarantee",
    textKey: "product.guarantees.moneyBack",
    configKey: "trustItem3",
  },
] as const;

function configText(
  config: Record<string, unknown> | null | undefined,
  key: string,
  lang: Language,
  fallback: string,
): string {
  const localizedKey = `${key}Ur`;
  if (lang === "ur" && typeof config?.[localizedKey] === "string") {
    return config[localizedKey] as string;
  }
  return typeof config?.[key] === "string" ? (config[key] as string) : fallback;
}

export function getTrustProofItems(
  lang: Language,
  config?: Record<string, unknown> | null,
): TrustProofItem[] {
  return TRUST_PROOF_SPECS.map((item) => {
    const fallback = t(item.textKey, lang) as string;
    return {
      id: item.id,
      icon: item.icon,
      tone: item.tone,
      text: configText(config, item.configKey, lang, fallback),
    };
  });
}
