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
  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageId, id))
    .orderBy(asc(pageSections.sortOrder))
    .all();

  return NextResponse.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      parsedConfig: safeJsonParseUnknown(row.config),
    })),
  });
}

export async function POST(request: Request, { params }: RouteContext) {
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
  const sectionId = generateId('ps');

  await db.insert(pageSections).values({
    id: sectionId,
    pageId: id,
    sectionType: body.sectionType,
    sortOrder: body.sortOrder ?? 0,
    config: body.config ? JSON.stringify(body.config) : null,
    active: body.active ?? true,
  });

  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (page) {
    revalidateTag(`page:${page.slug}`);
  }
  return NextResponse.json(
    { success: true, data: { id: sectionId } },
    { status: 201 },
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

  if (Array.isArray(body.sections)) {
    for (const section of body.sections) {
      const updates: Partial<typeof pageSections.$inferInsert> = {};
      if (section.sortOrder !== undefined) updates.sortOrder = section.sortOrder;
      if (section.active !== undefined) updates.active = section.active;
      if (section.config !== undefined) {
        updates.config = JSON.stringify(section.config);
      }
      if (section.sectionType !== undefined) {
        updates.sectionType = section.sectionType;
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(pageSections)
          .set(updates)
          .where(eq(pageSections.id, section.id));
      }
    }
  }

  const page = await db.select().from(pages).where(eq(pages.id, id)).get();
  if (page) {
    revalidateTag(`page:${page.slug}`);
  }
  return NextResponse.json({ success: true });
}
