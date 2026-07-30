/**
 * RECONSTRUCTED SOURCE
 *
 * Recreated from exact deployed route factory 73509.
 */

import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { couponSchema } from '@/lib/validations/admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const d1 = getD1();
    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }
    const coupon = await getDb(d1)
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .get();

    return coupon
      ? NextResponse.json({ success: true, data: coupon })
      : NextResponse.json(
          { success: false, error: 'Coupon not found' },
          { status: 404 },
        );
  } catch (error) {
    console.error('Coupon get error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const parsed = couponSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Validation failed',
        },
        { status: 400 },
      );
    }

    const d1 = getD1();
    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }
    const db = getDb(d1);
    const data = parsed.data;
    const code = data.code.toUpperCase();
    const existing = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .get();

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 },
      );
    }

    await db
      .update(coupons)
      .set({
        code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        appliesTo: data.appliesTo,
        active: data.active,
        startsAt: data.startsAt || null,
        expiresAt: data.expiresAt || null,
        updatedAt: sql`datetime('now')`,
      })
      .where(eq(coupons.id, id));

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const d1 = getD1();
    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }
    await getDb(d1).delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 },
    );
  }
}
