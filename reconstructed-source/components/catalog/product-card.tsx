"use client";

import { ArrowRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  getPublicProductPackageEntries,
  getPublicProductPackages,
  type ProductData,
} from "@/lib/content";
import { addToCart } from "@/lib/cart-store";
import type { Language } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

interface ProductCardProps {
  id?: string;
  slug: string;
  name: string;
  nameUr?: string | null;
  shortDescription?: string | null;
  shortDescriptionUr?: string | null;
  imageUrl?: string | null;
  badge?: string | null;
  badgeUr?: string | null;
  category?: string | null;
  parsedData?: ProductData | null;
  lang?: Language;
  source?: string;
  priority?: boolean;
}

export function ProductCard({
  id,
  slug,
  name,
  nameUr,
  shortDescription,
  shortDescriptionUr,
  imageUrl,
  badge,
  badgeUr,
  category,
  parsedData,
  lang = "en",
  source = "product_grid",
  priority = false,
}: ProductCardProps) {
  const isRtl = lang === "ur";
  const formatPriceLabel = (price: number) => {
    const formatted = price.toLocaleString("en-PK");
    return isRtl ? `روپے ${formatted}` : `PKR ${formatted}`;
  };
  const packages = parsedData?.packages || {};
  const packageEntries = getPublicProductPackageEntries(packages);
  const packageValues = getPublicProductPackages(packages);
  const lowestPrice =
    packageValues.length > 0
      ? Math.min(...packageValues.map((item) => item.price))
      : 0;
  const starterPackage = packageValues.find(
    (item) => item.price === lowestPrice,
  );
  const starterOriginalPrice =
    starterPackage?.originalPrice || lowestPrice;
  const hasDiscount = starterOriginalPrice > lowestPrice;
  const [defaultPackageKey, defaultPackage] =
    (packages.single ? ["single", packages.single] : packageEntries[0]) || [
      "single",
      null,
    ];

  const displayName = isRtl && nameUr ? nameUr : name;
  const displayDescription =
    isRtl && shortDescriptionUr ? shortDescriptionUr : shortDescription;
  const displayBadge = isRtl && badgeUr ? badgeUr : badge;
  const safeImageUrl =
    imageUrl &&
    !["null", "undefined"].includes(imageUrl.trim().toLowerCase())
      ? imageUrl
      : null;
  const isPreorder = Boolean(parsedData?.preorderEnabled);
  const preorderNote = isRtl
    ? parsedData?.preorderNoteUr || parsedData?.preorderNote || ""
    : parsedData?.preorderNote || parsedData?.preorderNoteUr || "";
  const categoryLabel =
    category === "skin_care"
      ? t("common.skinCare", lang)
      : t("common.hairCare", lang);

  const handleProductClick = () => {
    analytics.productCardClick({
      id,
      slug,
      name,
      category,
      source,
    });
  };

  const handleQuickAdd = () => {
    if (!defaultPackage || !id) return;
    addToCart({
      productId: id,
      productSlug: slug,
      productName: name,
      productNameUr: nameUr || undefined,
      productImage: safeImageUrl || undefined,
      packageType: defaultPackageKey,
      packageName: defaultPackage.name || defaultPackageKey,
      packageNameUr: defaultPackage.nameUr,
      isPreorder,
      preorderNote: parsedData?.preorderNote,
      preorderNoteUr: parsedData?.preorderNoteUr,
      unitPrice: defaultPackage.price,
      originalPrice:
        defaultPackage.originalPrice || defaultPackage.price,
      bottles: defaultPackage.bottles || 1,
    });
    analytics.addToCart({
      id,
      name,
      packageType: defaultPackageKey,
      price: defaultPackage.price,
      source: "quick_add",
    });
  };

  return (
    <article className="group overflow-hidden rounded-lg bg-white transition-all duration-300 hover:-translate-y-0.5">
      <Link
        href={`/products/${slug}`}
        prefetch={false}
        onClick={handleProductClick}
        className="relative block aspect-square overflow-hidden rounded-lg bg-[#f2f4f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        aria-label={`${t("common.view", lang)} ${displayName}`}
      >
        {safeImageUrl ? (
          <Image
            src={safeImageUrl}
            alt={displayName}
            fill
            priority={priority}
            className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(135deg,#f6f8f6,#e4ece8)] p-4 text-[#15191b]">
            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#7b8883]">
              UpDerma
            </div>
            <div className={cn("pb-2", isRtl && "text-right")}>
              <div
                className={cn(
                  "line-clamp-3 text-[15px] font-black leading-tight tracking-normal",
                  isRtl && "font-urdu",
                )}
              >
                {displayName}
              </div>
              <div className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#7b8883]">
                {categoryLabel}
              </div>
            </div>
          </div>
        )}
        {displayBadge && (
          <div
            className={cn(
              "absolute top-3",
              isRtl ? "right-3" : "left-3",
            )}
          >
            <span
              className={cn(
                "inline-block rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm",
                isRtl && "font-urdu-tight",
              )}
            >
              {displayBadge}
            </span>
          </div>
        )}
        <div
          className={cn(
            "absolute top-3",
            displayBadge && "hidden sm:block",
            displayBadge
              ? isRtl
                ? "left-3"
                : "right-3"
              : isRtl
                ? "right-3"
                : "left-3",
          )}
        >
          <span
            className={cn(
              "inline-block rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-500 backdrop-blur-sm",
              isRtl && "font-urdu-tight",
            )}
          >
            {categoryLabel}
          </span>
        </div>
      </Link>
      <div className="p-2 pt-2.5">
        <h3 className="mb-1">
          <Link
            href={`/products/${slug}`}
            prefetch={false}
            onClick={handleProductClick}
            className={cn(
              "line-clamp-2 rounded-sm text-[13px] font-black leading-snug text-[#111417] transition-colors group-hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
              isRtl && "text-right font-urdu-ui",
            )}
          >
            {displayName}
          </Link>
        </h3>
        {isPreorder && (
          <div
            className={cn(
              "mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              isRtl && "font-urdu-tight",
            )}
          >
            <span className="rounded-full border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
              {t("common.preOrder", lang)}
            </span>
            {preorderNote && <span className="text-gray-500">{preorderNote}</span>}
          </div>
        )}
        {displayDescription && (
          <p
            className={cn(
              "mb-2 line-clamp-2 text-[11px] font-medium leading-5 text-[#596661]",
              isRtl && "text-right font-urdu-ui",
            )}
          >
            {displayDescription}
          </p>
        )}
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            isRtl && "flex-row-reverse",
          )}
        >
          <div>
            <span className="text-[12px] font-black text-[#111417]">
              {formatPriceLabel(lowestPrice)}
            </span>
            {hasDiscount && (
              <span
                className={cn(
                  "text-xs text-gray-500 line-through",
                  isRtl ? "mr-1.5" : "ml-1.5",
                )}
              >
                {formatPriceLabel(starterOriginalPrice)}
              </span>
            )}
          </div>
          {id && defaultPackage ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#15191b] text-white opacity-100 transition-colors hover:bg-black",
                isRtl && "flex-row-reverse",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">
                {isPreorder
                  ? t("common.preOrder", lang)
                  : t("common.add", lang)}{" "}
                {displayName}
              </span>
            </button>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium text-emerald-700 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100",
                isRtl && "flex-row-reverse",
              )}
            >
              <span className={cn(isRtl && "font-urdu-tight")}>
                {t("common.view", lang)}
              </span>
              <ArrowRight
                className={cn("h-3.5 w-3.5", isRtl && "rotate-180")}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
