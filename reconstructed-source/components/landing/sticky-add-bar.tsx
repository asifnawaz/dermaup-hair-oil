"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";

import { addToCart } from "../../lib/cart-store";
import { formatPrice } from "./shared";
import type { Language, StickyProduct } from "./types";

export function StickyAddBar({
  product,
  lang,
  mobileOnly = true,
  buttonText,
  guaranteeText,
}: {
  product: StickyProduct;
  lang: Language;
  mobileOnly?: boolean;
  buttonText?: string;
  guaranteeText?: string;
}) {
  const add = () => {
    addToCart({
      productId: product.productId,
      productSlug: product.productSlug,
      productName: product.productName,
      productNameUr: product.productNameUr,
      productImage: product.productImage,
      packageType: product.packageType,
      packageName: product.packageName || product.packageType,
      packageNameUr: product.packageNameUr,
      unitPrice: product.price,
      originalPrice: product.originalPrice || product.price,
      bottles: product.bottles || 1,
      isPreorder: product.isPreorder,
      preorderNote: product.preorderNote,
      preorderNoteUr: product.preorderNoteUr,
    });
  };

  return (
    <aside
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 shadow-[0_-8px_28px_rgba(0,0,0,.12)] backdrop-blur ${
        mobileOnly ? "lg:hidden" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        {product.productImage ? (
          <Image
            alt=""
            className="h-11 w-11 rounded-lg bg-stone-100 object-cover"
            height={44}
            src={product.productImage}
            width={44}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-stone-950">
            {lang === "ur" && product.productNameUr
              ? product.productNameUr
              : product.productName}
          </p>
          <p className="text-xs font-bold text-emerald-900">
            {formatPrice(product.price)}
          </p>
          {guaranteeText ? (
            <p className="truncate text-[10px] text-stone-500">{guaranteeText}</p>
          ) : null}
        </div>
        <button
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-stone-950 px-4 text-xs font-semibold text-white"
          onClick={add}
          type="button"
        >
          <ShoppingBag className="h-4 w-4" />
          {buttonText || (lang === "ur" ? "کارٹ میں شامل کریں" : "Add to Cart")}
        </button>
      </div>
    </aside>
  );
}
