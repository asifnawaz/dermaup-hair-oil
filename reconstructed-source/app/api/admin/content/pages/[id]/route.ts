/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { asc, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { pageSections, pages } from '@/lib/db/schema';
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
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (!page) {
    return NextResponse.json(
      { success: false, error: 'Not found' },
      { status: 404 },
    );
  }

  const sections = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageId, id))
    .orderBy(asc(pageSections.sortOrder))
    .all();

  return NextResponse.json({
    success: true,
    data: {
      ...page,
      parsedMeta: safeJsonParseUnknown(page.meta),
      sections: sections.map((section) => ({
        ...section,
        parsedConfig: safeJsonParseUnknown(section.config),
      })),
    },
  });
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
  const updates: Partial<typeof pages.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.productId !== undefined) updates.productId = body.productId;
  if (body.title !== undefined) updates.title = body.title;
  if (body.meta !== undefined) updates.meta = JSON.stringify(body.meta);
  if (body.active !== undefined) updates.active = body.active;

  await db.update(pages).set(updates).where(eq(pages.id, id));
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();

  if (page) {
    revalidateTag(`page:${page.slug}`);
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
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  await db.delete(pageSections).where(eq(pageSections.pageId, id));
  await db.delete(pages).where(eq(pages.id, id));

  if (page) {
    revalidateTag(`page:${page.slug}`);
  }
  return NextResponse.json({ success: true });
}
