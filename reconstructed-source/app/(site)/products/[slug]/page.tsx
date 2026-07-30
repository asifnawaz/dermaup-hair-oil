import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LandingClient from "../../landing-client";
import JsonLd from "../../../../components/seo/json-ld";
import publicSnapshot from "../../../../data/public-snapshot-data.json";
import {
  getCachedAllContentBlocksForProduct,
  getCachedAllProducts,
  getCachedPageWithSections,
  getCachedProduct,
  getCachedProductPageByProductId,
  getCachedSettings,
  parseFaqs,
  parseTestimonials,
  type ParsedContentBlock,
  type ParsedPageSection,
  type ParsedProduct,
} from "../../../../lib/content";
import { getD1, getDb } from "../../../../lib/db";
import type { SectionType } from "../../../../lib/db/schema";
import { getLanguage } from "../../../../lib/language";
import {
  absoluteUrl,
  parsePageSeoMeta,
} from "../../../../lib/seo";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
} from "../../../../lib/structured-data";
import type { Language } from "../../../../lib/constants";

type SnapshotRoute = {
  route: string;
  data: {
    product?: unknown;
    sections?: unknown[];
    contentBlocks?: unknown[];
    allProducts?: unknown[];
  };
};

const productSnapshots = (publicSnapshot as { routes: SnapshotRoute[] }).routes
  .filter((entry) => entry.route.startsWith("/products/"))
  .filter((entry) => entry.data.product && entry.data.sections);

function snapshotProduct(slug: string): {
  product: ParsedProduct;
  sections: ParsedPageSection[];
  contentBlocks: ParsedContentBlock[];
  allProducts: ParsedProduct[];
} | null {
  const route = productSnapshots.find(
    (entry) => entry.route === `/products/${slug}`,
  );
  if (!route?.data.product || !route.data.sections) return null;
  return {
    product: route.data.product as ParsedProduct,
    sections: route.data.sections as ParsedPageSection[],
    contentBlocks: (route.data.contentBlocks || []) as ParsedContentBlock[],
    allProducts: (route.data.allProducts || []) as ParsedProduct[],
  };
}

function snapshotProducts(): ParsedProduct[] {
  return productSnapshots.map(
    (entry) => entry.data.product as ParsedProduct,
  );
}

function hasBlockType(
  contentBlocks: ParsedContentBlock[],
  type: string,
): boolean {
  return contentBlocks.some((block) => block.type === type);
}

function readProductGalleryImage(
  product: ParsedProduct,
  index: number,
): string {
  const images = product.parsedData.galleryImages;
  return Array.isArray(images) && typeof images[index] === "string"
    ? images[index]
    : "";
}

function readOptionalText(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getLocalizedProductName(
  product: ParsedProduct,
  lang: Language,
): string {
  return lang === "ur" && product.nameUr ? product.nameUr : product.name;
}

function getLocalizedProductDescription(
  product: ParsedProduct,
  lang: Language,
): string {
  const productData = product.parsedData;
  if (lang === "ur") {
    return (
      readOptionalText(productData.seoDescriptionUr) ||
      product.shortDescriptionUr ||
      readOptionalText(productData.descriptionUr) ||
      `آپ ڈرما سے ${getLocalizedProductName(product, lang)} خریدیں`
    );
  }
  return (
    readOptionalText(productData.seoDescription) ||
    product.shortDescription ||
    readOptionalText(productData.description) ||
    `Shop ${product.name} from UpDerma`
  );
}

/**
 * These delivery helpers survive in the original source index. The later
 * deployed bundle no longer calls them, but they are retained as recovered
 * editable behavior for CMS sections that reference deliverySchedule.
 */
function getPakistanDateOnly(date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(`${value.year}-${value.month}-${value.day}T00:00:00+05:00`);
}

function addCalendarDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isPakistanWorkingDay(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0;
}

function getNextPakistanWorkingDay(date: Date): Date {
  let nextDate = date;
  while (!isPakistanWorkingDay(nextDate)) {
    nextDate = addCalendarDays(nextDate, 1);
  }
  return nextDate;
}

function addPakistanWorkingDays(date: Date, days: number): Date {
  let nextDate = date;
  let remaining = days;
  while (remaining > 0) {
    nextDate = addCalendarDays(nextDate, 1);
    if (isPakistanWorkingDay(nextDate)) remaining -= 1;
  }
  return nextDate;
}

function formatPakistanDeliveryDate(
  date: Date,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildDeliveryScheduleConfig(lang: Language) {
  const start = getNextPakistanWorkingDay(
    addPakistanWorkingDays(getPakistanDateOnly(), 2),
  );
  const end = addPakistanWorkingDays(start, 2);
  const locale = lang === "ur" ? "ur-PK" : "en-PK";
  return {
    deliveryDateStart: formatPakistanDeliveryDate(start, locale),
    deliveryDateEnd: formatPakistanDeliveryDate(end, locale),
  };
}

function withProductHeroRuntimeConfig<T extends ParsedPageSection>(
  sections: T[],
  lang: Language,
): T[] {
  return sections.map((section) =>
    section.sectionType === "product_hero"
      ? {
          ...section,
          parsedConfig: {
            ...(section.parsedConfig || {}),
            deliverySchedule: buildDeliveryScheduleConfig(lang),
          },
        }
      : section,
  );
}

function getDefaultProductLandingSections(
  product: ParsedProduct,
  contentBlocks: ParsedContentBlock[],
): ParsedPageSection[] {
  const sections: ParsedPageSection[] = [];
  const section = (
    id: string,
    sectionType: SectionType,
    sortOrder: number,
    parsedConfig: Record<string, unknown>,
  ) => {
    sections.push({
      id,
      pageId: `generated_${product.id}`,
      sectionType,
      sortOrder,
      config: JSON.stringify(parsedConfig),
      parsedConfig,
      active: true,
      createdAt: null,
    });
  };

  const description =
    product.shortDescription ||
    readOptionalText(product.parsedData.description) ||
    `Shop ${product.name} from UpDerma.`;

  section("generated_product_hero", "product_hero", 10, {
    sectionId: "hero-product",
    layout: "default_product",
    badgeText: product.badge || "UpDerma routine",
    microBadgeText:
      product.category === "hair_care"
        ? "Targeted routine support"
        : "Premium-grade quality",
    heroDisplayTitle: product.name,
    heroSubheadlineText: description,
    heroBulletSource: "benefits",
    purchaseMode: "simple",
    simplePackageType: "single",
    simpleCtaAction: "add_to_cart",
    simpleCtaText: "Add to Cart",
    showPackageSelector: false,
    showHeroAccordions: false,
    showPostCtaTrustBadges: true,
    postCtaTrustBadge1: "COD Available",
    postCtaTrustBadge2: "90-day money-back guarantee",
    postCtaTrustBadge3: "WhatsApp support",
    stickyAddBar: true,
    stickyAddBarMobileOnly: true,
    stickyAddBarButtonText: "Add to Cart",
    includePrimaryImageInGallery: true,
    galleryAspect: "4 / 5",
    galleryObjectFit: "contain",
    galleryLeadImage: readProductGalleryImage(product, 0),
    galleryImage1: readProductGalleryImage(product, 1),
    galleryImage2: readProductGalleryImage(product, 2),
    galleryImage3: readProductGalleryImage(product, 3),
    galleryImage4: readProductGalleryImage(product, 4),
  });

  if (hasBlockType(contentBlocks, "result") || hasBlockType(contentBlocks, "before_after")) {
    section("generated_product_results", "results", 30, {
      variant: "lp",
      headline: "What consistent use can look like",
      subtitle:
        "Real routines are gradual. Look for feel, comfort and visible changes over time.",
    });
  }
  if (hasBlockType(contentBlocks, "how_to_use")) {
    section("generated_product_how_to_use", "how_it_works", 40, {
      variant: "lp",
      headline: "Use it the right way",
      subtitle:
        "A clear routine makes the product easier to judge and easier to repeat.",
    });
  }
  if (hasBlockType(contentBlocks, "ingredient")) {
    section("generated_product_ingredients", "ingredients", 50, {
      variant: "pdp_visual",
      headline: "Key actives",
      subtitle: "Ingredient-led support, explained in plain language.",
    });
  }
  if (hasBlockType(contentBlocks, "testimonial")) {
    section("generated_product_reviews", "testimonials", 60, {
      variant: "pdp_carousel",
      layout: "qure_reviews",
      sectionId: "reviews",
      eyebrow: "Customer proof",
      title: "Reviews by real routine concerns",
      useAvatarReviews: true,
    });
  }
  section("generated_product_guarantee", "guarantee", 80, {
    variant: "risk_free_card",
    layout: "risk_free_card",
    sectionId: "guarantee",
    eyebrow: "90-day money-back guarantee",
    headline: "Start the routine. Risk-free.",
    description:
      "If the product is not right for your routine, contact us on WhatsApp within 90 days. Refund policy terms apply and individual results vary.",
    badge1: "Refund Policy",
    badge2: "COD Available",
    badge3: "WhatsApp Support",
    ctaText: "Start My Routine",
    ctaHref: "#hero-product",
  });
  if (hasBlockType(contentBlocks, "faq")) {
    section("generated_product_faq", "faq", 90, {
      layout: "qure_faq",
      eyebrow: "Before you start",
      title: `Questions about ${product.name}`,
    });
  }
  section("generated_product_related", "related_products", 100, {
    sectionId: "more-products",
    headline: "Build only what your routine needs",
    subtitle:
      "Add the next step when it solves a real concern. Keep the routine simple enough to repeat.",
    maxItems: 3,
    filterCategory: "same",
  });

  return sections;
}

async function loadProduct(slug: string) {
  const fallback = snapshotProduct(slug);
  const d1 = getD1();
  if (!d1) {
    return fallback
      ? {
          product: fallback.product,
          sections: fallback.sections,
          page: null,
          contentBlocks: fallback.contentBlocks,
          allProducts: fallback.allProducts.length
            ? fallback.allProducts
            : snapshotProducts(),
          settings: {} as Record<string, unknown>,
        }
      : null;
  }

  try {
    const db = getDb(d1);
    const product = await getCachedProduct(db, slug);
    if (!product) return fallback ? {
      product: fallback.product,
      sections: fallback.sections,
      page: null,
      contentBlocks: fallback.contentBlocks,
      allProducts: fallback.allProducts.length
        ? fallback.allProducts
        : snapshotProducts(),
      settings: {} as Record<string, unknown>,
    } : null;

    const [pageBySlug, pageByProduct, allProducts, settings, contentBlocks] =
      await Promise.all([
        getCachedPageWithSections(db, slug),
        getCachedProductPageByProductId(db, product.id),
        getCachedAllProducts(db),
        getCachedSettings(db),
        getCachedAllContentBlocksForProduct(db, product.id),
      ]);
    const page = pageBySlug || pageByProduct;

    return {
      product,
      page: page?.page || null,
      sections:
        page?.sections?.length
          ? page.sections
          : fallback?.sections ||
            getDefaultProductLandingSections(product, contentBlocks),
      contentBlocks,
      allProducts,
      settings,
    };
  } catch (error) {
    console.error("[recovery] Product data query failed; using public snapshot", error);
    return fallback
      ? {
          product: fallback.product,
          sections: fallback.sections,
          page: null,
          contentBlocks: fallback.contentBlocks,
          allProducts: fallback.allProducts.length
            ? fallback.allProducts
            : snapshotProducts(),
          settings: {} as Record<string, unknown>,
        }
      : null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLanguage();
  const result = await loadProduct(slug);
  if (!result) {
    return {
      title: lang === "ur" ? "پروڈکٹ نہیں ملی - UpDerma" : "Product Not Found - UpDerma",
    };
  }

  const productData = result.product.parsedData;
  const meta = parsePageSeoMeta(result.page?.meta);
  const localizedName = getLocalizedProductName(result.product, lang);
  const seoTitle = readOptionalText(
    lang === "ur" ? productData.seoTitleUr : productData.seoTitle,
  );
  const title =
    lang === "ur"
      ? `${seoTitle || localizedName} - UpDerma`
      : result.page?.title
        ? `${result.page.title} - UpDerma`
        : `${seoTitle || result.product.name} - UpDerma`;
  const description =
    lang === "ur"
      ? getLocalizedProductDescription(result.product, lang)
      : meta?.description || getLocalizedProductDescription(result.product, lang);

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/products/${slug}`),
      type: "website",
      images: meta?.ogImage ? [absoluteUrl(meta.ogImage)] : undefined,
    },
    robots:
      result.page?.type === "advertorial"
        ? { index: false, follow: true }
        : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getLanguage();
  const result = await loadProduct(slug);
  if (!result) notFound();

  const productUrl = absoluteUrl(`/products/${slug}`);
  const description = getLocalizedProductDescription(result.product, lang);
  const image = result.product.imageUrl
    ? absoluteUrl(result.product.imageUrl)
    : undefined;
  const testimonials = parseTestimonials(
    result.contentBlocks.filter((block) => block.type === "testimonial"),
  );
  const faqs = parseFaqs(
    result.contentBlocks.filter((block) => block.type === "faq"),
  );
  const productSchema = buildProductSchema({
    product: result.product,
    url: productUrl,
    image,
    description,
    testimonials,
    lang,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: lang === "ur" ? "ہوم" : "Home", url: absoluteUrl("/") },
    {
      name: lang === "ur" ? "مصنوعات" : "Products",
      url: absoluteUrl("/products"),
    },
    {
      name: getLocalizedProductName(result.product, lang),
      url: productUrl,
    },
  ]);
  const faqSchema = buildFaqSchema(faqs);

  return (
    <>
      <JsonLd data={productSchema} id="product-jsonld" />
      <JsonLd data={breadcrumbSchema} id="product-breadcrumb-jsonld" />
      {faqSchema ? <JsonLd data={faqSchema} id="product-faq-jsonld" /> : null}
      <LandingClient
        allProducts={result.allProducts}
        contentBlocks={result.contentBlocks}
        lang={lang}
        pageSlug={slug}
        pageTitle={result.page?.title || result.product.name}
        pageType={result.page?.type || "product"}
        product={result.product}
        sections={withProductHeroRuntimeConfig(result.sections, lang)}
        siteSettings={result.settings}
      />
    </>
  );
}
