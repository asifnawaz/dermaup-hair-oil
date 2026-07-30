import type { Metadata } from "next";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import publicSnapshot from "@/data/public-snapshot-data.json";
import { getCachedAllProducts, type ParsedProduct } from "@/lib/content";
import { getD1, getDb } from "@/lib/db";
import { getTranslations } from "@/lib/i18n";
import { getLanguage } from "@/lib/language";
import { absoluteUrl } from "@/lib/seo";

const categories = ["all", "hair_care", "skin_care"] as const;
type ProductCategoryFilter = (typeof categories)[number];
const concernCategories = {
  hair_fall: "hair_care",
  thinning: "hair_care",
  dull_skin: "skin_care",
  texture: "skin_care",
} as const;
type ConcernKey = keyof typeof concernCategories;

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

const productsRoute = publicSnapshot.routes.find(
  (route) => route.route === "/products",
);
const FALLBACK_PRODUCTS =
  (productsRoute?.data.products as unknown as ParsedProduct[]) || [];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function SectionKicker({
  children,
  isRtl,
}: {
  children: React.ReactNode;
  isRtl: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#6f7b76] ${
        isRtl ? "flex-row-reverse font-urdu normal-case tracking-normal" : ""
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#9bcfbe]" />
      {children}
    </span>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const lang = await getLanguage();
  const catalog = getTranslations(lang).productsCatalog;
  const params = await searchParams;
  const isFiltered = Boolean(
    firstParam(params.category) || firstParam(params.concern),
  );

  return {
    title: catalog.metaTitle,
    description: catalog.metaDescription,
    alternates: { canonical: "/products" },
    openGraph: {
      title: catalog.metaTitle,
      description: catalog.metaDescription,
      url: absoluteUrl("/products"),
      type: "website",
    },
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = await getLanguage();
  const isRtl = lang === "ur";
  const catalog = getTranslations(lang).productsCatalog;
  const params = await searchParams;
  const concernParam = firstParam(params.concern);
  const concern =
    concernParam && concernParam in concernCategories
      ? (concernParam as ConcernKey)
      : undefined;
  const concernCopy = concern
    ? {
        ...catalog.concerns[concern],
        category: concernCategories[concern],
      }
    : undefined;
  const categoryParam = firstParam(params.category);
  const category: ProductCategoryFilter =
    categoryParam &&
    categories.includes(categoryParam as ProductCategoryFilter)
      ? (categoryParam as ProductCategoryFilter)
      : concernCopy?.category || "all";

  let allProducts = FALLBACK_PRODUCTS;
  const d1 = getD1();
  if (d1) {
    allProducts = await getCachedAllProducts(getDb(d1));
  }

  const products =
    category === "all"
      ? allProducts
      : allProducts.filter((product) => product.category === category);
  const visibleConcerns = (
    Object.keys(catalog.concerns) as ConcernKey[]
  ).filter(
    (key) =>
      category === "all" || concernCategories[key] === category,
  );
  const heroTitle = concernCopy
    ? concernCopy.title
    : catalog.defaultHeroTitle;
  const heroDescription = concernCopy
    ? concernCopy.description
    : catalog.defaultHeroDescription;
  const productsUrl = absoluteUrl("/products");
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: isRtl ? "ہوم" : "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: isRtl ? "مصنوعات" : "Products",
        item: productsUrl,
      },
    ],
  };
  const collectionData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: catalog.metaTitle,
    description: catalog.metaDescription,
    url: productsUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: isRtl && product.nameUr ? product.nameUr : product.name,
        url: absoluteUrl(`/products/${product.slug}`),
      })),
    },
  };

  return (
    <>
      {!concern && category === "all" && (
        <JsonLd id="products-collection-jsonld" data={collectionData} />
      )}
      <JsonLd id="products-breadcrumb-jsonld" data={breadcrumbData} />
      <div className="min-h-screen bg-white">
        <section className="border-b border-[#e6ebe8] bg-[#f2f4f3] py-6 text-[#171b1d] md:py-12">
          <div className="container mx-auto px-4 text-center">
            <SectionKicker isRtl={isRtl}>
              {catalog.shopByConcern}
            </SectionKicker>
            <h1
              className={`mx-auto mt-2 mb-2 max-w-2xl text-[2rem] font-semibold leading-[1.05] tracking-normal md:mt-3 md:mb-4 md:text-5xl ${
                isRtl ? "font-urdu" : ""
              }`}
            >
              {heroTitle}
            </h1>
            <p
              className={`mx-auto max-w-2xl text-sm font-semibold leading-6 text-[#53615c] md:text-base ${
                isRtl ? "font-urdu" : ""
              }`}
            >
              {heroDescription}
            </p>
          </div>
        </section>

        <section className="sticky top-[88px] z-30 border-b border-[#e6ebe8] bg-white py-3">
          <div className="container mx-auto px-4">
            <div className={isRtl ? "text-right" : ""}>
              <div
                className={`no-scrollbar flex gap-2 overflow-x-auto ${
                  isRtl ? "flex-row-reverse" : ""
                }`}
              >
                {visibleConcerns.map((key) => {
                  const active = concern === key;
                  return (
                    <Link
                      key={key}
                      href={`/products?category=${concernCategories[key]}&concern=${key}`}
                      className={`
                        min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors
                        ${
                          active
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                        }
                        ${isRtl ? "font-urdu" : ""}
                      `}
                    >
                      {catalog.concerns[key].label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            <p
              className={`mb-4 text-sm text-gray-500 ${
                isRtl ? "text-right font-urdu" : ""
              }`}
            >
              {products.length}{" "}
              {products.length === 1
                ? catalog.resultsCountSingle
                : catalog.resultsCountPlural}
            </p>
            <ProductGrid products={products} lang={lang} />
          </div>
        </section>
      </div>
    </>
  );
}
