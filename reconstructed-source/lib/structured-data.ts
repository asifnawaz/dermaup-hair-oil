import {
  getPublicProductPackages,
  type FaqItem,
  type ParsedProduct,
  type Testimonial,
} from "./content";

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductSchema({
  product,
  url,
  image,
  description,
  testimonials,
  lang = "en",
}: {
  product: ParsedProduct;
  url: string;
  image?: string;
  description: string;
  testimonials: Testimonial[];
  lang?: "en" | "ur";
}) {
  const isUrdu = lang === "ur";
  const offers = getPublicProductPackages(product.parsedData.packages || {}).map(
    (item) => ({
      "@type": "Offer",
      priceCurrency: "PKR",
      price: String(item.price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url,
      seller: { "@type": "Organization", name: "UpDerma" },
      name: (isUrdu && item.nameUr) || item.name,
      sku: product.sku || undefined,
    }),
  );
  const rating =
    testimonials.length > 0
      ? Number(
          (
            testimonials.reduce((total, item) => total + item.rating, 0) /
            testimonials.length
          ).toFixed(1),
        )
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: (isUrdu && product.nameUr) || product.name,
    description,
    sku: product.sku || undefined,
    category: product.category || undefined,
    brand: { "@type": "Brand", name: "UpDerma" },
    image: image ? [image] : undefined,
    offers,
    aggregateRating:
      rating !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: testimonials.length,
          }
        : undefined,
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerEn,
      },
    })),
  };
}

export function buildCollectionPageSchema({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}
