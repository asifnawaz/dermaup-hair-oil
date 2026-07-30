/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { asc } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { safeJsonParseUnknown } from '@/lib/json';

export async function GET(request: Request) {
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
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder))
    .all();

  return NextResponse.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      parsedData: safeJsonParseUnknown(row.data),
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
  const id = generateId('prod');

  await db.insert(products).values({
    id,
    slug: body.slug,
    name: body.name,
    nameUr: body.nameUr || null,
    sku: body.sku || null,
    data: JSON.stringify(body.data),
    active: body.active ?? true,
    sortOrder: body.sortOrder ?? 0,
  });

  revalidateTag(`product:${body.slug}`);
  return NextResponse.json(
    { success: true, data: { id } },
    { status: 201 },
  );
}
