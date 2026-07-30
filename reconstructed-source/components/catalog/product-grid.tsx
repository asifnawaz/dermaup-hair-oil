"use client";

import { useEffect } from "react";

import type { ParsedProduct } from "@/lib/content";
import type { Language } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: ParsedProduct[];
  lang?: Language;
}

export function ProductGrid({
  products,
  lang = "en",
}: ProductGridProps) {
  const isRtl = lang === "ur";

  useEffect(() => {
    if (products.length === 0) return;
    const categories = Array.from(
      new Set(products.map((product) => product.category || "uncategorized")),
    ).join(",");
    analytics.productListViewed(
      categories,
      products.map((product) => ({ id: product.id, name: product.name })),
    );
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className={cn("text-lg text-gray-500", isRtl && "font-urdu")}>
          {isRtl
            ? "فی الحال کوئی مصنوعات دستیاب نہیں"
            : "No products available yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          nameUr={product.nameUr}
          shortDescription={product.shortDescription}
          shortDescriptionUr={product.shortDescriptionUr}
          imageUrl={product.imageUrl}
          badge={product.badge}
          badgeUr={product.badgeUr}
          category={product.category}
          parsedData={product.parsedData}
          lang={lang}
          source="products_grid"
          priority={index === 0}
        />
      ))}
    </div>
  );
}
