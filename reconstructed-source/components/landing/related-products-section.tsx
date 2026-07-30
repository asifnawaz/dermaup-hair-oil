import {
  ProductCard,
  readNumber,
  readString,
  readText,
  SectionHeading,
  SectionShell,
} from "./shared";
import type { ProductCollectionProps } from "./types";

export function RelatedProductsSection({
  lang,
  config,
  products,
  currentProductId,
  currentCategory,
}: ProductCollectionProps) {
  const sameCategory = readString(config?.filterCategory, "same") === "same";
  const maxItems = readNumber(config, "maxItems", 3);
  const filtered = products
    .filter((product) => product.id !== currentProductId)
    .filter((product) => !sameCategory || !currentCategory || product.category === currentCategory)
    .slice(0, maxItems);

  if (!filtered.length) return null;

  return (
    <SectionShell id={readString(config?.sectionId, "more-products")} tone="cream">
      <SectionHeading
        eyebrow={readText(config, "sectionLabel", lang)}
        title={readText(config, "headline", lang, "Build only what your routine needs")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-9 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} lang={lang} product={product} />
        ))}
      </div>
    </SectionShell>
  );
}
