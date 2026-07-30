/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the production content module embedded in the latest
 * deployed Cloudflare Worker, then completed with export signatures and
 * tree-shaken query variants preserved by the surviving source index.
 */

import { and, asc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import type { DrizzleDB } from './db';
import {
  contentBlocks,
  pageSections,
  pages,
  products,
  siteSettings,
  type ContentBlock,
  type ContentBlockType,
  type Page,
  type PageSection,
  type Product,
  type ProductCategory,
} from './db/schema';
import { safeJsonParse } from './json';

export type Testimonial = {
  slug: string;
  name: string;
  nameUr: string;
  city: string;
  cityUr: string;
  age: number;
  rating: number;
  text: string;
  textUr: string;
  verified: boolean;
};

export type FaqItem = {
  slug: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
};

export type ProductPackage = {
  name?: string;
  nameUr?: string;
  price: number;
  originalPrice?: number;
  bottles?: number;
  savings?: string;
  savingsUr?: string;
  popular?: boolean;
  hidden?: boolean;
  [key: string]: unknown;
};

export type ProductData = {
  volume: string;
  packages: Record<string, ProductPackage>;
  preorderEnabled?: boolean;
  preorderNote?: string;
  preorderNoteUr?: string;
  [key: string]: any;
};

export function isPublicProductPackage(
  pkg: ProductData['packages'][string] | undefined | null,
): pkg is ProductData['packages'][string] {
  return pkg != null && pkg.hidden !== true;
}

export function getPublicProductPackageEntries(
  packages?: ProductData['packages'] | null,
): Array<[string, ProductData['packages'][string]]> {
  return Object.entries(packages || {}).filter(([, pkg]) =>
    isPublicProductPackage(pkg),
  );
}

export function getPublicProductPackages(
  packages?: ProductData['packages'] | null,
): ProductData['packages'][string][] {
  return getPublicProductPackageEntries(packages).map(([, pkg]) => pkg);
}

export type ParsedProduct = Product & {
  parsedData: ProductData;
};

export type ParsedContentBlock = ContentBlock & {
  parsedData: Record<string, unknown>;
};

export type ParsedPageSection = PageSection & {
  parsedConfig: Record<string, unknown> | null;
};

export type PageWithSections = {
  page: Page;
  sections: ParsedPageSection[];
  product: ParsedProduct | null;
};

export const EMPTY_PRODUCT_DATA: ProductData = {
  volume: '',
  packages: {},
};

export function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export async function getAllActiveProducts(
  db: DrizzleDB,
): Promise<ParsedProduct[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder))
    .all();

  return rows.map((row) => ({
    ...row,
    parsedData: safeJsonParse(row.data, EMPTY_PRODUCT_DATA),
  }));
}

export async function getProductsByCategory(
  db: DrizzleDB,
  category: ProductCategory,
): Promise<ParsedProduct[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.category, category), eq(products.active, true)))
    .orderBy(asc(products.sortOrder))
    .all();

  return rows.map((row) => ({
    ...row,
    parsedData: safeJsonParse(row.data, EMPTY_PRODUCT_DATA),
  }));
}

export async function getProduct(
  db: DrizzleDB,
  slug: string,
): Promise<ParsedProduct | null> {
  const row = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .get();

  return row
    ? { ...row, parsedData: safeJsonParse(row.data, EMPTY_PRODUCT_DATA) }
    : null;
}

export async function getProductById(
  db: DrizzleDB,
  id: string,
): Promise<ParsedProduct | null> {
  const row = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();

  return row
    ? { ...row, parsedData: safeJsonParse(row.data, EMPTY_PRODUCT_DATA) }
    : null;
}

export async function getContentBlocks(
  db: DrizzleDB,
  type: ContentBlockType,
  productId?: string | null,
): Promise<ParsedContentBlock[]> {
  const conditions = [
    eq(contentBlocks.type, type),
    eq(contentBlocks.active, true),
  ];

  if (productId) {
    conditions.push(eq(contentBlocks.productId, productId));
  }

  const rows = await db
    .select()
    .from(contentBlocks)
    .where(and(...conditions))
    .orderBy(asc(contentBlocks.sortOrder))
    .all();

  return rows.map((row) => ({
    ...row,
    parsedData: safeJsonParse(row.data, {}),
  }));
}

export function getAllContentBlocksForProduct(
  db: DrizzleDB,
  productId: string,
): Promise<ParsedContentBlock[]> {
  return getAllContentBlocksForOwner(db, productId);
}

export async function getAllContentBlocksForOwner(
  db: DrizzleDB,
  ownerId: string,
): Promise<ParsedContentBlock[]> {
  const rows = await db
    .select()
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.productId, ownerId),
        eq(contentBlocks.active, true),
      ),
    )
    .orderBy(asc(contentBlocks.sortOrder))
    .all();

  return rows.map((row) => ({
    ...row,
    parsedData: safeJsonParse(row.data, {}),
  }));
}

export function getPageBySlug(
  db: DrizzleDB,
  slug: string,
): Promise<Page | undefined> {
  return db
    .select()
    .from(pages)
    .where(and(eq(pages.slug, slug), eq(pages.active, true)))
    .get();
}

export function getPageByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<Page | undefined> {
  return db
    .select()
    .from(pages)
    .where(and(eq(pages.productId, productId), eq(pages.active, true)))
    .get();
}

export function getProductPageByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<Page | undefined> {
  return db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.productId, productId),
        eq(pages.type, 'product'),
        eq(pages.active, true),
      ),
    )
    .get();
}

export async function getPageWithSectionsByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<PageWithSections | null> {
  const page = await getPageByProductId(db, productId);
  if (!page) {
    return null;
  }

  const sections = await getPageSections(db, page.id);
  const product = page.productId
    ? await getProductById(db, page.productId)
    : null;

  return { page, sections, product };
}

export async function getProductPageWithSectionsByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<PageWithSections | null> {
  const page = await getProductPageByProductId(db, productId);
  if (!page) {
    return null;
  }

  const sections = await getPageSections(db, page.id);
  const product = page.productId
    ? await getProductById(db, page.productId)
    : null;

  return { page, sections, product };
}

export async function getPageSections(
  db: DrizzleDB,
  pageId: string,
): Promise<ParsedPageSection[]> {
  const rows = await db
    .select()
    .from(pageSections)
    .where(
      and(
        eq(pageSections.pageId, pageId),
        eq(pageSections.active, true),
      ),
    )
    .orderBy(asc(pageSections.sortOrder))
    .all();

  return rows.map((row) => ({
    ...row,
    parsedConfig: safeJsonParse<Record<string, unknown> | null>(
      row.config,
      null,
    ),
  }));
}

export async function getPageWithSections(
  db: DrizzleDB,
  pageSlug: string,
): Promise<PageWithSections | null> {
  const page = await getPageBySlug(db, pageSlug);
  if (!page) {
    return null;
  }

  const sections = await getPageSections(db, page.id);
  const product = page.productId
    ? await getProductById(db, page.productId)
    : null;

  return { page, sections, product };
}

export function parseTestimonials(
  blocks: { slug: string; data: string }[],
): Testimonial[] {
  return blocks.map((block) => {
    const data = safeJsonParse<Record<string, unknown>>(block.data, {});

    return {
      slug: block.slug,
      name: stringValue(data.name),
      nameUr: stringValue(data.nameUr),
      city: stringValue(data.city),
      cityUr: stringValue(data.cityUr),
      age: numberValue(data.age),
      rating: numberValue(data.rating, 5),
      text: stringValue(data.textEn),
      textUr: stringValue(data.textUr),
      verified: data.verified === true || data.status === 'verified',
    };
  });
}

export function parseFaqs(
  blocks: { slug: string; data: string }[],
): FaqItem[] {
  return blocks.map((block) => {
    const data = safeJsonParse<Record<string, unknown>>(block.data, {});

    return {
      slug: block.slug,
      questionEn: stringValue(data.questionEn),
      questionUr: stringValue(data.questionUr),
      answerEn: stringValue(data.answerEn),
      answerUr: stringValue(data.answerUr),
    };
  });
}

export const CACHE_TTL = 300;
export const BYPASS_CACHE = process.env.NODE_ENV === 'development';

export function getCachedPageWithSections(
  db: DrizzleDB,
  slug: string,
): Promise<PageWithSections | null> {
  if (BYPASS_CACHE) {
    return getPageWithSections(db, slug);
  }

  return unstable_cache(
    () => getPageWithSections(db, slug),
    [`page:${slug}`],
    { tags: [`page:${slug}`], revalidate: CACHE_TTL },
  )();
}

export function getCachedContentBlocks(
  db: DrizzleDB,
  type: ContentBlockType,
  productId?: string | null,
): Promise<ParsedContentBlock[]> {
  if (BYPASS_CACHE) {
    return getContentBlocks(db, type, productId);
  }

  const key = `blocks:${type}:${productId || 'all'}`;
  return unstable_cache(
    () => getContentBlocks(db, type, productId),
    [key],
    { tags: [`blocks:${type}`], revalidate: CACHE_TTL },
  )();
}

export function getCachedPageByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<PageWithSections | null> {
  if (BYPASS_CACHE) {
    return getPageWithSectionsByProductId(db, productId);
  }

  return unstable_cache(
    () => getPageWithSectionsByProductId(db, productId),
    [`page-by-product:${productId}`],
    { tags: [`page-by-product:${productId}`], revalidate: CACHE_TTL },
  )();
}

export function getCachedProductPageByProductId(
  db: DrizzleDB,
  productId: string,
): Promise<PageWithSections | null> {
  if (BYPASS_CACHE) {
    return getProductPageWithSectionsByProductId(db, productId);
  }

  return unstable_cache(
    () => getProductPageWithSectionsByProductId(db, productId),
    [`product-page-by-product:${productId}`],
    {
      tags: [`product-page-by-product:${productId}`],
      revalidate: CACHE_TTL,
    },
  )();
}

export function getCachedAllContentBlocksForProduct(
  db: DrizzleDB,
  productId: string,
): Promise<ParsedContentBlock[]> {
  return getCachedAllContentBlocksForOwner(db, productId);
}

export function getCachedAllContentBlocksForOwner(
  db: DrizzleDB,
  ownerId: string,
): Promise<ParsedContentBlock[]> {
  if (BYPASS_CACHE) {
    return getAllContentBlocksForOwner(db, ownerId);
  }

  return unstable_cache(
    () => getAllContentBlocksForOwner(db, ownerId),
    [`all-blocks:${ownerId}`],
    { tags: [`all-blocks:${ownerId}`], revalidate: CACHE_TTL },
  )();
}

export function getCachedProduct(
  db: DrizzleDB,
  slug: string,
): Promise<ParsedProduct | null> {
  if (BYPASS_CACHE) {
    return getProduct(db, slug);
  }

  return unstable_cache(
    () => getProduct(db, slug),
    [`product:${slug}`],
    { tags: [`product:${slug}`], revalidate: CACHE_TTL },
  )();
}

export function getCachedAllProducts(
  db: DrizzleDB,
): Promise<ParsedProduct[]> {
  if (BYPASS_CACHE) {
    return getAllActiveProducts(db);
  }

  return unstable_cache(
    () => getAllActiveProducts(db),
    ['all-products'],
    { tags: ['all-products'], revalidate: CACHE_TTL },
  )();
}

export function getCachedProductsByCategory(
  db: DrizzleDB,
  category: ProductCategory,
): Promise<ParsedProduct[]> {
  if (BYPASS_CACHE) {
    return getProductsByCategory(db, category);
  }

  return unstable_cache(
    () => getProductsByCategory(db, category),
    [`products:${category}`],
    { tags: [`products:${category}`], revalidate: CACHE_TTL },
  )();
}

export async function getSettings(
  db: DrizzleDB,
): Promise<Record<string, unknown>> {
  const rows = await db.select().from(siteSettings).all();
  const result: Record<string, unknown> = {};

  for (const row of rows) {
    result[row.key] = safeJsonParse(row.value, row.value);
  }

  return result;
}

export function getCachedSettings(
  db: DrizzleDB,
): Promise<Record<string, unknown>> {
  if (BYPASS_CACHE) {
    return getSettings(db);
  }

  return unstable_cache(
    () => getSettings(db),
    ['settings'],
    { tags: ['settings'], revalidate: CACHE_TTL },
  )();
}
