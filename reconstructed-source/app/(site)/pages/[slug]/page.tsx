import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCachedAllContentBlocksForOwner,
  getCachedAllProducts,
  getCachedPageWithSections,
} from "@/lib/content";
import { getD1, getDb } from "@/lib/db";
import { getLanguage } from "@/lib/language";
import {
  absoluteUrl,
  parsePageSeoMeta,
  type PageSeoMeta,
} from "@/lib/seo";

import LandingClient from "../../landing-client";

type DynamicLandingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: DynamicLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const d1 = getD1();

  if (!d1) {
    return {
      title: "Page - UpDerma",
      alternates: { canonical: `/pages/${slug}` },
    };
  }

  const db = getDb(d1);
  const pageData = await getCachedPageWithSections(db, slug);

  if (!pageData) {
    return {
      title: "Page Not Found - UpDerma",
      robots: { index: false, follow: false },
    };
  }

  const parsedMeta = parsePageSeoMeta(pageData.page.meta) as
    | (PageSeoMeta & { ogTitle?: string })
    | null;
  const description =
    parsedMeta?.description || `${pageData.page.title} from UpDerma.`;
  const isIndexablePage = pageData.page.type === "page";

  return {
    title: `${pageData.page.title} - UpDerma`,
    description,
    alternates: { canonical: `/pages/${slug}` },
    openGraph: {
      title: parsedMeta?.ogTitle || `${pageData.page.title} - UpDerma`,
      description,
      url: absoluteUrl(`/pages/${slug}`),
      type: "website",
      images: parsedMeta?.ogImage
        ? [absoluteUrl(parsedMeta.ogImage)]
        : undefined,
    },
    robots: isIndexablePage ? undefined : { index: false, follow: true },
  };
}

export default async function DynamicLandingPage({
  params,
}: DynamicLandingPageProps) {
  const { slug } = await params;
  const lang = await getLanguage();
  const d1 = getD1();

  if (!d1) notFound();

  const db = getDb(d1);
  const pageData = await getCachedPageWithSections(db, slug);

  if (!pageData) notFound();

  const contentBlockOwnerId =
    (pageData.product?.id ?? null) || `page:${slug}`;
  const needsAllProducts = pageData.sections.some(
    (section) => section.sectionType === "featured_products",
  );
  const [contentBlocks, allProducts] = await Promise.all([
    getCachedAllContentBlocksForOwner(db, contentBlockOwnerId),
    needsAllProducts ? getCachedAllProducts(db) : Promise.resolve([]),
  ]);

  return (
    <LandingClient
      lang={lang}
      pageSlug={slug}
      pageType={pageData.page.type || "page"}
      pageTitle={pageData.page.title}
      sections={pageData.sections}
      product={pageData.product}
      contentBlocks={contentBlocks}
      allProducts={allProducts}
    />
  );
}
