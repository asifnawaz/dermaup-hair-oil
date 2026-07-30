/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { contentBlocks } from '@/lib/db/schema';
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
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
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
  const previous = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
    .get();
  const updates: Partial<typeof contentBlocks.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.type !== undefined) updates.type = body.type;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.productId !== undefined) updates.productId = body.productId;
  if (body.data !== undefined) updates.data = JSON.stringify(body.data);
  if (body.active !== undefined) updates.active = body.active;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

  await db
    .update(contentBlocks)
    .set(updates)
    .where(eq(contentBlocks.id, id));

  const current = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
    .get();

  if (previous) {
    revalidateTag(`blocks:${previous.type}`);
    if (previous.productId) {
      revalidateTag(`all-blocks:${previous.productId}`);
    }
  }
  if (current) {
    revalidateTag(`blocks:${current.type}`);
    if (current.productId) {
      revalidateTag(`all-blocks:${current.productId}`);
    }
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
    .from(contentBlocks)
    .where(eq(contentBlocks.id, id))
    .get();
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));

  if (row) {
    revalidateTag(`blocks:${row.type}`);
    if (row.productId) {
      revalidateTag(`all-blocks:${row.productId}`);
    }
  }

  return NextResponse.json({ success: true });
}
