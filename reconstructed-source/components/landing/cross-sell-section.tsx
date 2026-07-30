import { RelatedProductsSection } from "./related-products-section";
import type { ProductCollectionProps } from "./types";

export function CrossSellSection(props: ProductCollectionProps) {
  return <RelatedProductsSection {...props} />;
}
