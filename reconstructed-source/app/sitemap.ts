import { and, eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

import { getAllActiveProducts } from "@/lib/content";
import { getD1, getDb } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { absoluteUrl, toDate } from "@/lib/seo";

const EXCLUDED_PAGE_SLUGS = new Set([
  "home",
  "delivery-returns",
  "privacy",
  "refund",
  "terms",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
  const d1 = getD1();

  if (!d1) return entries;

  const db = getDb(d1);
  const [activeProducts, activePages] = await Promise.all([
    getAllActiveProducts(db),
    db
      .select({
        slug: pages.slug,
        type: pages.type,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(and(eq(pages.active, true), eq(pages.type, "page")))
      .all(),
  ]);

  entries.push(
    ...activeProducts.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: toDate(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );
  entries.push(
    ...activePages
      .filter((page) => !EXCLUDED_PAGE_SLUGS.has(page.slug))
      .map((page) => ({
        url: absoluteUrl(`/pages/${page.slug}`),
        lastModified: toDate(page.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  );

  return entries;
}
