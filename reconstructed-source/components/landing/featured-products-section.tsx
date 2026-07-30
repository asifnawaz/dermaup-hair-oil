import {
  ProductCard,
  readNumber,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { BaseSectionProps, ParsedProduct } from "./types";

export type FeaturedProductsSectionProps = BaseSectionProps & {
  products: ParsedProduct[];
};

export function FeaturedProductsSection({ lang, products, config }: FeaturedProductsSectionProps) {
  const limit = readNumber(config, "limit", 3);
  return (
    <SectionShell id={readString(config?.sectionId)} tone="cream">
      <SectionHeading
        title={readText(config, "heading", lang, readText(config, "headline", lang, "Featured products"))}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-8 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, limit).map((product) => (
          <ProductCard key={product.id} lang={lang} product={product} />
        ))}
      </div>
    </SectionShell>
  );
}
