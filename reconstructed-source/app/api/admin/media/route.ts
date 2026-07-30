/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb, getMediaBucket } from '@/lib/db';
import { media } from '@/lib/db/schema';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const query = productId
    ? db
        .select()
        .from(media)
        .where(eq(media.productId, productId))
        .orderBy(desc(media.createdAt))
    : db.select().from(media).orderBy(desc(media.createdAt));
  const rows = await query.all();

  return NextResponse.json({ success: true, data: rows });
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

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const productId = formData.get('productId') as string | null;
  const alt = formData.get('alt') as string | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file provided' },
      { status: 400 },
    );
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: `File type ${file.type} not allowed` },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, error: 'File too large (max 5MB)' },
      { status: 400 },
    );
  }

  const id = generateId('med');
  const extension = file.name.split('.').pop() || 'bin';
  const key = `media/${id}.${extension}`;
  const contents = await file.arrayBuffer();
  const bucket = getMediaBucket();
  if (!bucket) {
    return NextResponse.json(
      { success: false, error: 'Media bucket not available' },
      { status: 500 },
    );
  }

  await bucket.put(key, contents, {
    httpMetadata: { contentType: file.type },
  });
  await getDb(d1).insert(media).values({
    id,
    key,
    filename: file.name,
    alt: alt || null,
    mimeType: file.type,
    size: file.size,
    productId: productId || null,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        id,
        key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/api/admin/media/${id}/file`,
      },
    },
    { status: 201 },
  );
}
