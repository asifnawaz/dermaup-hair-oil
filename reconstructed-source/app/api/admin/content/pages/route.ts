/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { asc, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import { pageSections, pages } from '@/lib/db/schema';
import { safeJsonParseUnknown } from '@/lib/json';

const PAGE_TEMPLATES: Record<string, string[]> = {
  'product-landing': [
    'hero',
    'problem',
    'solution',
    'ingredients',
    'before_after',
    'testimonials',
    'benefits',
    'pricing',
    'faq',
    'checkout',
    'cta',
  ],
  'sale-campaign': [
    'promo_banner',
    'hero',
    'pricing',
    'testimonials',
    'social_proof_bar',
    'faq',
    'checkout',
    'cta',
  ],
  'content-page': ['hero', 'education', 'benefits', 'how_it_works', 'cta'],
};

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const query = productId
    ? db
        .select()
        .from(pages)
        .where(eq(pages.productId, productId))
        .orderBy(asc(pages.slug))
    : db.select().from(pages).orderBy(asc(pages.slug));
  const rows = await query.all();

  return NextResponse.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      parsedMeta: safeJsonParseUnknown(row.meta),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const body = (await request.json()) as Record<string, any>;
  const id = generateId('page');

  await db.insert(pages).values({
    id,
    slug: body.slug,
    productId: body.productId || null,
    title: body.title,
    meta: body.meta ? JSON.stringify(body.meta) : null,
    active: body.active ?? true,
  });

  const template = body.template ? PAGE_TEMPLATES[body.template] : null;
  if (template) {
    for (let index = 0; index < template.length; index += 1) {
      await db.insert(pageSections).values({
        id: generateId('ps'),
        pageId: id,
        sectionType: template[index] as typeof pageSections.$inferInsert.sectionType,
        sortOrder: index,
        active: true,
      });
    }
  }

  revalidateTag(`page:${body.slug}`);
  return NextResponse.json(
    { success: true, data: { id } },
    { status: 201 },
  );
}
