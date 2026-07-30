"use client";

/**
 * RECONSTRUCTED SOURCE
 *
 * The original component was not present in an active production chunk.
 * Its data flow, public-package filtering, cart payload, analytics payload,
 * signatures, and button states come from the surviving source index.
 * The surrounding card markup is a conservative visual reconstruction.
 */

import { Check, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { addToCart } from "@/lib/cart-store";
import {
  getPublicProductPackageEntries,
  getPublicProductPackages,
  type ProductData,
} from "@/lib/content";
import type { Language } from "@/lib/constants";
import type { Product } from "@/lib/db/schema";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

export type ProductWithParsedData = Product & { parsedData: ProductData };

export interface OrderBumpProps {
  products: ProductWithParsedData[];
  currentProductSlugs: string[];
  lang?: Language;
}

export function OrderBump({
  products,
  currentProductSlugs,
  lang = "en",
}: OrderBumpProps) {
  const isRtl = lang === "ur";
  const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());
  const bumpProducts = products.filter(
    (product) => !currentProductSlugs.includes(product.slug),
  );

  if (bumpProducts.length === 0) return null;

  const handleAdd = (product: ProductWithParsedData) => {
    const packages = product.parsedData.packages;
    const firstPkg = getPublicProductPackageEntries(packages)[0];
    if (!firstPkg) return;

    const [pkgKey, pkg] = firstPkg;
    const isPreorder = product.parsedData.preorderEnabled;
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productNameUr: product.nameUr || undefined,
      productImage: product.imageUrl || undefined,
      packageType: pkgKey,
      packageName: pkg.name || pkgKey,
      packageNameUr: pkg.nameUr,
      isPreorder,
      preorderNote: product.parsedData.preorderNote,
      preorderNoteUr: product.parsedData.preorderNoteUr,
      unitPrice: pkg.price,
      originalPrice: pkg.originalPrice || pkg.price,
      bottles: pkg.bottles || 1,
    });
    analytics.addToCart({
      id: product.id,
      name: product.name,
      price: pkg.price,
      quantity: 1,
      packageType: pkgKey,
      source: "order_bump",
    });
    setAddedSlugs((previous) => new Set(previous).add(product.slug));
  };

  return (
    <section
      className={cn(
        "mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4",
        isRtl && "text-right",
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h3
        className={cn(
          "mb-3 text-sm font-semibold text-stone-900",
          isRtl && "font-urdu",
        )}
      >
        {t("orderBump.title", lang)}
      </h3>

      <div className="space-y-2">
        {bumpProducts.map((product) => {
          const packages = product.parsedData.packages;
          const publicPackages = getPublicProductPackages(packages);
          const startingPrice =
            publicPackages.length > 0
              ? Math.min(...publicPackages.map((pkg) => pkg.price))
              : 0;
          const isAdded = addedSlugs.has(product.slug);
          const displayName =
            isRtl && product.nameUr ? product.nameUr : product.name;

          return (
            <article
              key={product.slug}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2.5",
                isRtl && "flex-row-reverse",
              )}
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={displayName}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium text-stone-900",
                    isRtl && "font-urdu",
                  )}
                >
                  {displayName}
                </p>
                {startingPrice > 0 && (
                  <p className="mt-0.5 text-xs text-stone-500">
                    {isRtl ? "روپے " : "Rs. "}
                    {startingPrice.toLocaleString("en-PK")}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={isAdded}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0",
                  isAdded
                    ? "bg-primary/10 text-primary cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                  isRtl && "font-urdu flex-row-reverse",
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t("common.added", lang)}
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    {t("common.add", lang)}
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
