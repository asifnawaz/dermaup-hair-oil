/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { pageSections, pages } from '@/lib/db/schema';

type RouteContext = {
  params: Promise<{ id: string; sectionId: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id, sectionId } = await params;
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  await db.delete(pageSections).where(eq(pageSections.id, sectionId));
  const page = await db.select().from(pages).where(eq(pages.id, id)).get();

  if (page) {
    revalidateTag(`page:${page.slug}`);
  }
  return NextResponse.json({ success: true });
}
