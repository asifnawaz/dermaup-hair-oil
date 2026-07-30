import Image from "next/image";

import { cn } from "@/lib/utils";
import type { TrustIconName } from "@/lib/trust-proof";

const TRUST_ICON_SRC: Record<TrustIconName, string> = {
  results: "/icons/trust/results-64.webp",
  dermatologist: "/icons/trust/dermatologist-approved-64.webp",
  payment: "/icons/trust/payment-cod-64.webp",
  guarantee: "/icons/trust/guarantee-64.webp",
};

interface TrustIconImageProps {
  name: TrustIconName;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

export function TrustIconImage({
  name,
  alt,
  className,
  imageClassName,
  sizes = "40px",
}: TrustIconImageProps) {
  return (
    <span
      className={cn(
        "relative block h-9 w-9 flex-shrink-0 sm:h-10 sm:w-10",
        className,
      )}
    >
      <Image
        src={TRUST_ICON_SRC[name]}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-contain", imageClassName)}
      />
    </span>
  );
}
