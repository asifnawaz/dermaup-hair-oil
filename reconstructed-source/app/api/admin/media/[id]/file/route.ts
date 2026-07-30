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
    return new Response('DB not available', { status: 500 });
  }

  const db = getDb(d1);
  const [row] = await db
    .select()
    .from(media)
    .where(eq(media.id, id))
    .all();
  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  const bucket = getMediaBucket();
  if (!bucket) {
    return new Response('Media bucket not available', { status: 500 });
  }

  const object = await bucket.get(row.key);
  if (!object) {
    return new Response('File not found in storage', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', row.mimeType);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (object.size) {
    headers.set('Content-Length', String(object.size));
  }

  return new Response(object.body, { headers });
}
