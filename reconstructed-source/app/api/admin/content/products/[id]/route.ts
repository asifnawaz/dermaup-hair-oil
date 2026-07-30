/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { safeJsonParseUnknown } from '@/lib/json';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id } = await params;
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const row = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();

  return row
    ? NextResponse.json({
        success: true,
        data: { ...row, parsedData: safeJsonParseUnknown(row.data) },
      })
    : NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 },
      );
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id } = await params;
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const body = (await request.json()) as Record<string, any>;
  const updates: Partial<typeof products.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.name !== undefined) updates.name = body.name;
  if (body.nameUr !== undefined) updates.nameUr = body.nameUr;
  if (body.sku !== undefined) updates.sku = body.sku;
  if (body.data !== undefined) updates.data = JSON.stringify(body.data);
  if (body.active !== undefined) updates.active = body.active;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

  await db.update(products).set(updates).where(eq(products.id, id));
  const row = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();

  if (row) {
    revalidateTag(`product:${row.slug}`);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id } = await params;
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const row = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();
  await db.delete(products).where(eq(products.id, id));

  if (row) {
    revalidateTag(`product:${row.slug}`);
  }
  return NextResponse.json({ success: true });
}
