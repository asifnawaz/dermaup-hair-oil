"use client";

/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from production client chunk 3779 (module 19025) and checked
 * against the surviving source index. Markup, trigger thresholds, copy,
 * analytics payload, and timing match the deployed implementation.
 */

import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-store";
import type { Language } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

export interface StickyAddBarProps {
  productId: string;
  productSlug: string;
  productName: string;
  productNameUr?: string;
  productImage?: string;
  packageType: string;
  packageName: string;
  packageNameUr?: string;
  isPreorder?: boolean;
  preorderNote?: string;
  preorderNoteUr?: string;
  price: number;
  originalPrice: number;
  bottles: number;
  freeDelivery?: boolean;
  lang?: Language;
  mobileOnly?: boolean;
  guaranteeText?: string;
  buttonText?: string;
  zIndexClassName?: string;
}

export function StickyAddBar({
  productId,
  productSlug,
  productName,
  productNameUr,
  productImage,
  packageType,
  packageName,
  packageNameUr,
  isPreorder,
  preorderNote,
  preorderNoteUr,
  price,
  originalPrice,
  bottles,
  freeDelivery,
  lang = "en",
  mobileOnly = false,
  buttonText,
  zIndexClassName = "z-50",
}: StickyAddBarProps) {
  const isRtl = lang === "ur";
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let frame = 0;
    const getAnchor = () =>
      document.querySelector("[data-sticky-add-anchor]");
    const updateVisibility = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const anchor = getAnchor();
        if (anchor) {
          setVisible(anchor.getBoundingClientRect().bottom < 0);
          frame = 0;
          return;
        }

        setVisible(
          window.scrollY > Math.max(900, 1.2 * window.innerHeight),
        );
        frame = 0;
      });
    };

    const anchor = getAnchor();
    const observer =
      anchor && "IntersectionObserver" in window
        ? new IntersectionObserver(updateVisibility, {
            threshold: 0.15,
            rootMargin: "0px 0px -8% 0px",
          })
        : null;

    if (anchor && observer) observer.observe(anchor);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const displayName = isRtl && productNameUr ? productNameUr : productName;
  const displayPreorderNote = isRtl
    ? preorderNoteUr || preorderNote || ""
    : preorderNote || preorderNoteUr || "";
  const displayPrice = isRtl
    ? `روپے ${price.toLocaleString("en-PK")}`
    : `Rs. ${price.toLocaleString("en-PK")}`;

  const handleAdd = () => {
    addToCart({
      productId,
      productSlug,
      productName,
      productNameUr,
      productImage,
      packageType,
      packageName,
      packageNameUr,
      isPreorder,
      preorderNote,
      preorderNoteUr,
      unitPrice: price,
      originalPrice,
      bottles,
    });
    analytics.addToCart({
      id: productId,
      name: productName,
      price,
      quantity: 1,
      packageType,
      source: "sticky_add_bar",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2_000);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-screen max-w-[100vw] border-t border-white/20 bg-white/80 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out supports-[backdrop-filter]:bg-white/72",
        zIndexClassName,
        mobileOnly && "md:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div
        className="container mx-auto px-4 py-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-black/5 bg-white shadow-sm">
            {productImage ? (
              <Image
                src={productImage}
                alt={displayName}
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-500">
                <ShoppingBag className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className={cn("flex-1 min-w-0", isRtl && "text-right")}>
            <p
              className={cn(
                "truncate text-sm font-bold leading-tight text-stone-950",
                isRtl && "font-urdu",
              )}
            >
              {displayName}
            </p>

            {isPreorder && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-0.5",
                  isRtl && "flex-row-reverse justify-end",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200",
                    isRtl && "font-urdu-tight",
                  )}
                >
                  {isRtl ? "پری آرڈر" : "Pre-order"}
                </span>
                {displayPreorderNote && (
                  <span
                    className={cn(
                      "text-[10px] text-muted-foreground",
                      isRtl && "font-urdu-tight",
                    )}
                  >
                    {displayPreorderNote}
                  </span>
                )}
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-1.5 flex-wrap",
                isRtl && "flex-row-reverse justify-end",
              )}
            >
              <span className="text-sm font-medium text-gray-600">
                {displayPrice}
              </span>
              {freeDelivery && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  {isRtl ? "مفت ڈیلیوری" : "Free Delivery"}
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            className={cn(
              "h-10 min-w-[112px] flex-shrink-0 rounded-full bg-black px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-black/90",
              isRtl && "font-urdu",
            )}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                <span>{t("cart.added", lang)}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {isPreorder
                    ? t("common.preOrder", lang)
                    : buttonText || t("cart.addToCart", lang)}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
