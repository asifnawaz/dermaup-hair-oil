/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { and, asc, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import {
  contentBlocks,
  type ContentBlockType,
} from '@/lib/db/schema';
import { safeJsonParseUnknown } from '@/lib/json';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const productId = searchParams.get('productId');
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const conditions = [];
  if (type) {
    conditions.push(eq(contentBlocks.type, type as ContentBlockType));
  }
  if (productId) {
    conditions.push(eq(contentBlocks.productId, productId));
  }

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(contentBlocks)
          .where(and(...conditions))
          .orderBy(asc(contentBlocks.sortOrder))
          .all()
      : await db
          .select()
          .from(contentBlocks)
          .orderBy(asc(contentBlocks.type), asc(contentBlocks.sortOrder))
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
  const id = generateId('cb');

  await db.insert(contentBlocks).values({
    id,
    type: body.type,
    slug: body.slug,
    productId: body.productId || null,
    data: JSON.stringify(body.data),
    active: body.active ?? true,
    sortOrder: body.sortOrder ?? 0,
  });

  revalidateTag(`blocks:${body.type}`);
  if (body.productId) {
    revalidateTag(`all-blocks:${body.productId}`);
  }

  return NextResponse.json(
    { success: true, data: { id } },
    { status: 201 },
  );
}
