import {
  getPublicProductPackages,
  type ParsedProduct,
  type Testimonial,
} from "./content";
import type { Language } from "./constants";

export type HomepageProduct = ParsedProduct;
export type StorefrontCopy = Record<string, any>;
export type HomepageCopy = Record<string, any>;
export type ProductsCatalogCopy = Record<string, any>;

export interface HomepageMetricViewModel {
  label: string;
  value: string;
}

export interface HomepageLinkPillViewModel {
  label: string;
  href: string;
}

export interface HomepageHeroProductViewModel {
  name: string;
  description: string;
  href: string;
  imageUrl: string | null;
  badge: string | null;
}

export interface HomepageCategoryViewModel {
  key: "hair_care" | "skin_care";
  title: string;
  body: string;
  href: string;
  cta: string;
  imageUrl: string | null;
  productCount: number;
}

export interface HomepageNavigationTileViewModel {
  label: string;
  href: string;
  imageUrl: string | null;
  eyebrow: string;
}

export interface HomepageProductCardViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  imageUrl: string | null;
  badge: string | null;
  categoryLabel: string;
  routineLabel: string;
  usageLabel: string;
  bestForLabel: string;
  decisionLabel: string;
  ctaLabel: string;
  volumeLabel: string;
  priceLabel?: string;
  compareAtPriceLabel?: string;
}

export interface HomepageResultCardViewModel {
  title: string;
  body: string;
  href: string;
  imageUrl: string | null;
  productName: string;
  label: string | null;
}

export interface HomepageTestimonialCardViewModel {
  name: string;
  city: string;
  text: string;
  rating: number;
  verifiedLabel: string;
}

export interface HomepageConcernCardViewModel {
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  imageUrl: string | null;
}

export interface HomepageGuidanceCardViewModel {
  title: string;
  body: string;
}

export interface HomepageViewModel {
  lang: Language;
  isRtl: boolean;
  whatsappUrl: string;
  hero: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    stickyCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    concernPrompt: string;
    concernLinks: HomepageLinkPillViewModel[];
    metrics: HomepageMetricViewModel[];
    reassurancePoints: string[];
    visualImageUrl: string;
    featuredProducts: HomepageHeroProductViewModel[];
  };
  categories: HomepageCategoryViewModel[];
  navigationTiles: HomepageNavigationTileViewModel[];
  proof: {
    eyebrow: string;
    quote: string;
    footnote: string;
    metrics: HomepageMetricViewModel[];
  };
  bestsellers: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    href: string;
    products: HomepageProductCardViewModel[];
  };
  results: {
    eyebrow: string;
    title: string;
    subtitle: string;
    resultCards: HomepageResultCardViewModel[];
    testimonials: HomepageTestimonialCardViewModel[];
  };
  concerns: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: HomepageConcernCardViewModel[];
  };
  guidance: {
    eyebrow: string;
    title: string;
    body: string;
    visualImageUrl: string;
    cards: HomepageGuidanceCardViewModel[];
  };
  finalCta: {
    title: string;
    body: string;
    primary: string;
    primaryHref: string;
    secondary: string;
    secondaryHref: string;
    points: string[];
  };
  consult: {
    eyebrow: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
}

export interface BuildHomepageViewModelInput {
  lang: Language;
  products: HomepageProduct[];
  testimonials: Testimonial[];
  siteSettings: Record<string, unknown>;
  homepageCopy: HomepageCopy;
  catalogCopy: ProductsCatalogCopy;
  whatsappUrl: string;
}

export const HOMEPAGE_IMAGE_FALLBACKS = {
  hero: "/homepage/skin-confidence-hero.webp",
  proof: "/homepage/customer-routine-proof.webp",
  guidance: "/homepage/daily-routine-flatlay.webp",
} as const;

export const PRODUCT_SLUG_ORDER = [
  "hair-growth-oil",
  "glass-glow-serum",
  "rice-glow-cream",
  "rice-renew-cream",
] as const;

const productRoutineMeta: Record<
  string,
  {
    routineLabel: string;
    usageLabel: string;
    bestForLabel: string;
    decisionLabel: string;
  }
> = {
  "hair-growth-oil": {
    routineLabel: "Scalp + root support",
    usageLabel: "3-4 nights weekly",
    bestForLabel: "Hair fall",
    decisionLabel:
      "Start here if shedding, weak roots, or slower growth is the concern you notice most.",
  },
  "glass-glow-serum": {
    routineLabel: "Hydration layer",
    usageLabel: "AM/PM serum",
    bestForLabel: "Hydration",
    decisionLabel:
      "Start here if your skin feels dull or dehydrated and you want a lighter daily layer.",
  },
  "rice-glow-cream": {
    routineLabel: "Morning glow cream",
    usageLabel: "Daytime step",
    bestForLabel: "Morning glow",
    decisionLabel:
      "Start here if you want a brighter daytime finish without adding many steps.",
  },
  "rice-renew-cream": {
    routineLabel: "Night renewal cream",
    usageLabel: "Night step",
    bestForLabel: "Night repair",
    decisionLabel:
      "Start here if texture, fine lines, or firmness are the concern you want to work on at night.",
  },
};

const concernOrder = ["hair_fall", "thinning", "dull_skin", "texture"] as const;
const concernHref: Record<(typeof concernOrder)[number], string> = {
  hair_fall: "/products?category=hair_care&concern=hair_fall",
  thinning: "/products?category=hair_care&concern=thinning",
  dull_skin: "/products?category=skin_care&concern=dull_skin",
  texture: "/products?category=skin_care&concern=texture",
};

export function getLocalizedProductName(
  product: HomepageProduct,
  lang: Language,
): string {
  return lang === "ur" && product.nameUr ? product.nameUr : product.name;
}

export function getLocalizedProductDescription(
  product: HomepageProduct,
  lang: Language,
): string {
  const data = product.parsedData as Record<string, any>;
  if (lang === "ur") {
    return (
      data.seoDescriptionUr ||
      product.shortDescriptionUr ||
      data.descriptionUr ||
      getLocalizedProductName(product, lang)
    );
  }
  return (
    data.seoDescription ||
    product.shortDescription ||
    data.description ||
    product.name
  );
}

export function getLocalizedProductBadge(
  product: HomepageProduct,
  lang: Language,
): string | null {
  return (lang === "ur" && product.badgeUr ? product.badgeUr : product.badge) || null;
}

export function getCategoryLabel(
  product: HomepageProduct,
  catalogCopy: ProductsCatalogCopy,
): string {
  return catalogCopy.categoryLabels?.[product.category || ""] || product.category || "";
}

export function getGalleryImages(product: HomepageProduct): string[] {
  const value = (product.parsedData as Record<string, unknown>).galleryImages;
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function getVisualImage(product: HomepageProduct): string | null {
  return product.imageUrl || getGalleryImages(product)[0] || null;
}

export function findProductImage(
  products: HomepageProduct[],
  fallbackProducts: HomepageProduct[] = [],
): string | null {
  return (
    products.map(getVisualImage).find(Boolean) ||
    fallbackProducts.map(getVisualImage).find(Boolean) ||
    null
  );
}

export function getLowestPackage(product: HomepageProduct) {
  const packages = getPublicProductPackages(product.parsedData?.packages);
  return packages.length
    ? packages.reduce((lowest, item) =>
        item.price < lowest.price ? item : lowest,
      )
    : null;
}

export function formatPrice(price: number, lang: Language): string {
  const formatted = price.toLocaleString("en-PK");
  return lang === "ur" ? `روپے ${formatted}` : `PKR ${formatted}`;
}

export function getPriceLabels(
  product: HomepageProduct,
  lang: Language,
): { priceLabel?: string; compareAtPriceLabel?: string } {
  const lowest = getLowestPackage(product);
  if (!lowest) return {};
  const originalPrice = lowest.originalPrice || lowest.price;
  return {
    priceLabel: formatPrice(lowest.price, lang),
    compareAtPriceLabel:
      originalPrice > lowest.price
        ? formatPrice(originalPrice, lang)
        : undefined,
  };
}

export function getResultImage(product: HomepageProduct): string | null {
  const gallery = getGalleryImages(product);
  if (product.slug === "rice-glow-cream") {
    return gallery.find((image) => image.includes("gallery-benefit")) ||
      getVisualImage(product);
  }
  return getVisualImage(product);
}

export function getProductRoutineMeta(
  product: HomepageProduct,
  lang: Language,
) {
  const fallback = productRoutineMeta[product.slug] || {
    routineLabel: "",
    usageLabel: "",
    bestForLabel: "",
    decisionLabel: getLocalizedProductDescription(product, lang),
  };
  return fallback;
}

type ProductGuideCopy = {
  routineLabel?: string;
  usageLabel?: string;
  bestForLabel?: string;
  decisionLabel?: string;
};

export function getProductGuideCopy(
  copy: StorefrontCopy,
  slug: string,
): ProductGuideCopy {
  return copy.productGuide?.[slug] || {};
}

export function orderHomepageProducts(
  products: HomepageProduct[],
): HomepageProduct[] {
  const order = new Map<string, number>(
    PRODUCT_SLUG_ORDER.map((slug, index) => [slug, index]),
  );
  return [...products].sort(
    (left, right) => {
      const leftOrder = order.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return (
        leftOrder - rightOrder ||
        (left.sortOrder || 0) - (right.sortOrder || 0) ||
        left.name.localeCompare(right.name)
      );
    },
  );
}

export function buildProductCard(
  product: HomepageProduct,
  lang: Language,
  catalogCopy: ProductsCatalogCopy,
  storefrontCopy: StorefrontCopy,
): HomepageProductCardViewModel {
  const routineMeta = {
    ...getProductRoutineMeta(product, lang),
    ...getProductGuideCopy(storefrontCopy, product.slug),
  };
  return {
    id: product.id,
    slug: product.slug,
    name: getLocalizedProductName(product, lang),
    description: getLocalizedProductDescription(product, lang),
    href: `/products/${product.slug}`,
    imageUrl: getVisualImage(product),
    badge: getLocalizedProductBadge(product, lang),
    categoryLabel: getCategoryLabel(product, catalogCopy),
    routineLabel: routineMeta.routineLabel || "",
    usageLabel: routineMeta.usageLabel || "",
    bestForLabel: routineMeta.bestForLabel || "",
    decisionLabel: routineMeta.decisionLabel || "",
    ctaLabel: storefrontCopy.productCta,
    volumeLabel: String(product.parsedData?.volume || ""),
    ...getPriceLabels(product, lang),
  };
}

export function buildHeroProduct(
  product: HomepageProduct,
  lang: Language,
): HomepageHeroProductViewModel {
  return {
    name: getLocalizedProductName(product, lang),
    description: getLocalizedProductDescription(product, lang),
    href: `/products/${product.slug}`,
    imageUrl: getVisualImage(product),
    badge: getLocalizedProductBadge(product, lang),
  };
}

export function getProductHref(product?: HomepageProduct): string {
  return product ? `/products/${product.slug}` : "/products";
}

export function resolveConcernProduct(
  concern: (typeof concernOrder)[number],
  hairCareProducts: HomepageProduct[],
  skinCareProducts: HomepageProduct[],
): HomepageProduct | undefined {
  if (concern === "hair_fall" || concern === "thinning") {
    return hairCareProducts.find((product) => product.slug.includes("hair")) ||
      hairCareProducts[0];
  }
  if (concern === "texture") {
    return (
      skinCareProducts.find((product) => product.slug.includes("renew")) ||
      skinCareProducts[0]
    );
  }
  return (
    skinCareProducts.find((product) => product.slug.includes("glass")) ||
    skinCareProducts[0]
  );
}

export function getConfiguredFormulaImage(
  siteSettings: Record<string, unknown>,
  index: number,
): string | null {
  const imageStory = siteSettings.homepageImageStory;
  return Array.isArray(imageStory) && typeof imageStory[index] === "string"
    ? imageStory[index].trim() || null
    : null;
}

export function buildHomepageViewModel({
  lang,
  products,
  testimonials,
  siteSettings,
  homepageCopy,
  catalogCopy,
  whatsappUrl,
}: BuildHomepageViewModelInput): HomepageViewModel {
  void siteSettings;
  const copy: StorefrontCopy = homepageCopy.storefront || homepageCopy;
  const isRtl = lang === "ur";
  const orderedProducts = orderHomepageProducts(products);
  const hairCareProducts = orderedProducts.filter(
    (product) => product.category === "hair_care",
  );
  const skinCareProducts = orderedProducts.filter(
    (product) => product.category === "skin_care",
  );
  const featuredProducts = orderedProducts.slice(0, 4);
  const bestsellers = featuredProducts.map((product) =>
    buildProductCard(product, lang, catalogCopy, copy),
  );
  const metrics: HomepageMetricViewModel[] = [
    { label: copy.trustRatingLabel, value: copy.trustRatingValue },
    { label: copy.trustDeliveryLabel, value: copy.trustDeliveryValue },
    { label: copy.trustPaymentLabel, value: copy.trustPaymentValue },
    { label: copy.trustSupportLabel, value: copy.trustSupportValue },
  ];
  const concernLinks = (copy.concernLinks || []).map(
    (label: string, index: number) => ({
      label,
      href: getProductHref(
        [
          hairCareProducts[0],
          skinCareProducts.find((product) => product.slug.includes("glass")),
          skinCareProducts.find((product) => product.slug.includes("glow-cream")),
          skinCareProducts.find((product) => product.slug.includes("renew")),
        ][index],
      ),
    }),
  );

  const concernCards = concernOrder.map((concern) => {
    const concernCopy = catalogCopy.concerns?.[concern] || {};
    const product = resolveConcernProduct(
      concern,
      hairCareProducts,
      skinCareProducts,
    );
    return {
      label: concernCopy.label || concern,
      title: concernCopy.title || "",
      description: concernCopy.description || "",
      href: product ? getProductHref(product) : concernHref[concern],
      cta: lang === "ur" ? "ابھی خریدیں" : "Shop Now",
      imageUrl: product ? getVisualImage(product) : null,
    };
  });

  return {
    lang,
    isRtl,
    whatsappUrl,
    hero: {
      eyebrow: copy.eyebrow,
      headline: copy.headline,
      subtitle: copy.subtitle,
      primaryCta: copy.primaryCta,
      stickyCta: copy.stickyCta,
      primaryHref: "/products",
      secondaryCta: copy.secondaryCta,
      secondaryHref: "/products",
      concernPrompt: copy.concernPrompt,
      concernLinks,
      metrics,
      reassurancePoints: copy.reassurancePoints || [],
      visualImageUrl: HOMEPAGE_IMAGE_FALLBACKS.hero,
      featuredProducts: featuredProducts.map((product) =>
        buildHeroProduct(product, lang),
      ),
    },
    categories: [
      {
        key: "hair_care",
        title: copy.categoryHairTitle,
        body: copy.categoryHairBody,
        href: getProductHref(hairCareProducts[0]),
        cta: copy.exploreHair,
        imageUrl: findProductImage(hairCareProducts, orderedProducts),
        productCount: hairCareProducts.length,
      },
      {
        key: "skin_care",
        title: copy.categorySkinTitle,
        body: copy.categorySkinBody,
        href: getProductHref(skinCareProducts[0]),
        cta: copy.exploreSkin,
        imageUrl: findProductImage(skinCareProducts, orderedProducts),
        productCount: skinCareProducts.length,
      },
    ],
    navigationTiles: [],
    proof: {
      eyebrow: copy.proofEyebrow,
      quote: copy.proofQuote,
      footnote: copy.proofFootnote,
      metrics,
    },
    bestsellers: {
      eyebrow: copy.bestsellersEyebrow,
      title: copy.bestsellersTitle,
      body: copy.bestsellersBody,
      cta: copy.secondaryCta,
      href: "/products",
      products: bestsellers,
    },
    results: {
      eyebrow: lang === "ur" ? "حقیقی نتائج" : "Real Results",
      title: copy.resultsTitle,
      subtitle: copy.resultsSubtitle,
      resultCards: featuredProducts.slice(0, 3).map((product) => ({
        title: getLocalizedProductName(product, lang),
        body: getLocalizedProductDescription(product, lang),
        href: getProductHref(product),
        imageUrl: getResultImage(product),
        productName: getLocalizedProductName(product, lang),
        label: getLocalizedProductBadge(product, lang),
      })),
      testimonials: testimonials.slice(0, 4).map((testimonial) => ({
        name:
          lang === "ur" && testimonial.nameUr
            ? testimonial.nameUr
            : testimonial.name,
        city:
          lang === "ur" && testimonial.cityUr
            ? testimonial.cityUr
            : testimonial.city,
        text:
          lang === "ur" && testimonial.textUr
            ? testimonial.textUr
            : testimonial.text,
        rating: testimonial.rating,
        verifiedLabel: lang === "ur" ? "تصدیق شدہ" : "Verified",
      })),
    },
    concerns: {
      eyebrow: copy.concernsEyebrow,
      title: copy.concernsTitle,
      subtitle: copy.concernsSubtitle,
      cards: concernCards,
    },
    guidance: {
      eyebrow: copy.guidanceEyebrow,
      title: copy.guidanceTitle,
      body: copy.guidanceBody,
      visualImageUrl: HOMEPAGE_IMAGE_FALLBACKS.guidance,
      cards: copy.guidanceCards || [],
    },
    finalCta: {
      title: copy.finalTitle,
      body: copy.finalBody,
      primary: copy.finalPrimary,
      primaryHref: "/products",
      secondary: copy.finalSecondary,
      secondaryHref: "/products",
      points: copy.closingPoints || [],
    },
    consult: {
      eyebrow: copy.consultEyebrow,
      title: copy.consultTitle,
      body: copy.consultBody,
      primary: copy.consultPrimary,
      secondary: copy.consultSecondary,
    },
  };
}
