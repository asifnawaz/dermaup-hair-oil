import Link from "next/link";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";

import { readString, readText, SectionHeading, SectionShell } from "./shared";
import type { BaseSectionProps, ParsedProduct } from "./types";

export type FeaturedCategoriesSectionProps = BaseSectionProps & {
  products: ParsedProduct[];
};

export function FeaturedCategoriesSection({ lang, products, config }: FeaturedCategoriesSectionProps) {
  const categories = [
    {
      id: "skin_care",
      title: lang === "ur" ? "اسکن کیئر" : "Skin care",
      count: products.filter((product) => product.category === "skin_care").length,
      Icon: Sparkles,
    },
    {
      id: "hair_care",
      title: lang === "ur" ? "ہیئر کیئر" : "Hair care",
      count: products.filter((product) => product.category === "hair_care").length,
      Icon: Droplets,
    },
  ].filter((category) => category.count > 0);

  return (
    <SectionShell id={readString(config?.sectionId)} tone="white">
      <SectionHeading
        title={readText(config, "headline", lang, "Shop by concern")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        {categories.map(({ id, title, count, Icon }) => (
          <Link className="group rounded-2xl border border-stone-200 bg-stone-50 p-6" href={`/products?category=${id}`} key={id}>
            <Icon className="h-7 w-7 text-emerald-800" />
            <h3 className="mt-5 text-2xl font-semibold text-stone-950">{title}</h3>
            <p className="mt-1 text-sm text-stone-500">{count} products</p>
            <ArrowRight className="mt-5 h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}
