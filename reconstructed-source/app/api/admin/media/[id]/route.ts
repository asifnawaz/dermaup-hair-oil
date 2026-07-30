/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb, getMediaBucket } from '@/lib/db';
import { media } from '@/lib/db/schema';

type RouteContext = { params: Promise<{ id: string }> };

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
  const [row] = await db
    .select()
    .from(media)
    .where(eq(media.id, id))
    .all();
  if (!row) {
    return NextResponse.json(
      { success: false, error: 'Not found' },
      { status: 404 },
    );
  }

  const bucket = getMediaBucket();
  if (!bucket) {
    return NextResponse.json(
      { success: false, error: 'Media bucket not available' },
      { status: 500 },
    );
  }

  try {
    await bucket.delete(row.key);
  } catch {
    // Deployed behavior still removes the database record if R2 deletion fails.
  }
  await db.delete(media).where(eq(media.id, id));

  return NextResponse.json({ success: true });
}
