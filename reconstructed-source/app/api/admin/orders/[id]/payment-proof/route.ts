/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 12620.
 */

import { eq } from 'drizzle-orm';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb, getMediaBucket } from '@/lib/db';
import { orders } from '@/lib/db/schema';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return new Response('Not authenticated', { status: 401 });
  }

  const { id } = await params;
  const d1 = getD1();
  const bucket = getMediaBucket();

  if (!d1 || !bucket) {
    return new Response('Storage unavailable', { status: 503 });
  }

  const order = await getDb(d1)
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .get();
  const proofUrl = order?.paymentScreenshotUrl;

  if (!proofUrl) {
    return new Response('Payment proof not found', { status: 404 });
  }
  if (/^https?:\/\//.test(proofUrl)) {
    return Response.redirect(proofUrl, 302);
  }

  const object = await bucket.get(proofUrl);
  if (!object) {
    return new Response('File not found in storage', { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream',
  );
  headers.set('Cache-Control', 'private, max-age=60');
  if (object.size) headers.set('Content-Length', String(object.size));

  return new Response(object.body, { headers });
}
