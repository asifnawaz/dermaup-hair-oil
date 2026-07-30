import { cn } from "@/lib/utils";
import type { TrustProofItem, TrustProofTone } from "@/lib/trust-proof";

import { TrustIconImage } from "./trust-icon-image";

const CARD_TONE_CLASSES: Record<TrustProofTone, string> = {
  results: "bg-emerald-50 border-emerald-100 text-emerald-950",
  dermatologist: "bg-teal-50 border-teal-100 text-teal-950",
  payment: "bg-sky-50 border-sky-100 text-sky-950",
  guarantee: "bg-amber-50 border-amber-100 text-amber-950",
};

interface TrustProofStripProps {
  items: TrustProofItem[];
  isRtl?: boolean;
  variant?: "cards" | "inline";
  className?: string;
}

export function TrustProofStrip({
  items,
  isRtl = false,
  variant = "cards",
  className,
}: TrustProofStripProps) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-stone-700 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 sm:text-xs",
          isRtl && "flex-row-reverse",
          className,
        )}
      >
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              "flex min-h-5 min-w-0 items-center gap-1.5 font-semibold leading-[1.15]",
              isRtl && "flex-row-reverse font-urdu-tight",
            )}
          >
            <TrustIconImage
              name={item.icon}
              alt=""
              className="h-4 w-4 flex-shrink-0 sm:h-8 sm:w-8"
              sizes="32px"
            />
            <span className="min-w-0">{item.text}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2",
        isRtl && "direction-rtl",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-xl border p-1.5 text-center sm:min-h-[92px] sm:gap-1.5 sm:p-2.5",
            CARD_TONE_CLASSES[item.tone],
          )}
        >
          <TrustIconImage
            name={item.icon}
            alt=""
            className="h-7 w-7 sm:h-10 sm:w-10"
          />
          <span
            className={cn(
              "text-[9px] font-semibold leading-tight sm:text-xs",
              isRtl && "font-urdu-tight",
            )}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
