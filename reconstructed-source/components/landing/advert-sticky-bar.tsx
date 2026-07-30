"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import type { Language } from "./types";

export function AdvertStickyBar({
  productName,
  productNameUr,
  productHref,
  lang,
}: {
  productName: string;
  productNameUr?: string;
  productHref: string;
  lang: Language;
}) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 p-2 shadow-[0_-8px_28px_rgba(0,0,0,.12)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="truncate pl-2 text-sm font-semibold text-stone-950">
          {lang === "ur" && productNameUr ? productNameUr : productName}
        </p>
        <Link className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-stone-950 px-5 text-xs font-semibold text-white" href={productHref}>
          <ShoppingBag className="h-4 w-4" />
          {lang === "ur" ? "پروڈکٹ دیکھیں" : "View product"}
        </Link>
      </div>
    </aside>
  );
}
