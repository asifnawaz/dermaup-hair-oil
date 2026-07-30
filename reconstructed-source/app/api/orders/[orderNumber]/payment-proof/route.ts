/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed payment-proof route module and checked
 * against the original indexed signatures. Upload validation, R2 layout, D1
 * writes, and response text match production.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { generateId, getD1, getDb, getMediaBucket } from '@/lib/db';
import {
  ORDER_ACTIONS,
  orderActivity,
  orders,
} from '@/lib/db/schema';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
]);
const MAX_SIZE = 5 * 1024 * 1024;

function getSafeExtension(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension && ALLOWED_EXTENSIONS.has(extension)) {
    return extension;
  }

  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/heic') return 'heic';
  if (file.type === 'image/heif') return 'heif';
  return null;
}

function getContentType(file: File, extension: string): string {
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return file.type;
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  return 'application/octet-stream';
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const d1 = getD1();
  const bucket = getMediaBucket();

  if (!d1 || !bucket) {
    return NextResponse.json(
      { success: false, error: 'Upload service unavailable' },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No screenshot selected' },
      { status: 400 },
    );
  }

  const extension = getSafeExtension(file);

  if (
    !extension ||
    (file.type && !ALLOWED_MIME_TYPES.has(file.type))
  ) {
    return NextResponse.json(
      { success: false, error: 'Please upload a screenshot image' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: 'Screenshot must be under 5MB' },
      { status: 400 },
    );
  }

  const db = getDb(d1);
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .get();

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 },
    );
  }

  if (order.paymentMethod === 'cod') {
    return NextResponse.json(
      {
        success: false,
        error: 'Payment proof is not needed for COD orders',
      },
      { status: 400 },
    );
  }

  const proofKey = `payment-proofs/${order.id}/${generateId(
    'proof',
  )}.${extension}`;
  await bucket.put(proofKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: getContentType(file, extension) },
  });

  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ paymentScreenshotUrl: proofKey, updatedAt: now })
      .where(eq(orders.id, order.id));
    await tx.insert(orderActivity).values({
      id: generateId('act'),
      orderId: order.id,
      action: ORDER_ACTIONS.NOTE_ADDED,
      details: JSON.stringify({
        note: 'Payment proof uploaded by customer',
        filename: file.name,
        size: file.size,
        mimeType: file.type || null,
      }),
      performedBy: 'customer',
    });
  });

  return NextResponse.json({ success: true });
}
