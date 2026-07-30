/**
 * RECONSTRUCTED SOURCE
 *
 * Recreated from exact deployed route factory 90717.
 */

import { count, desc, eq, ilike } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { coupons } from '@/lib/db/schema';
import { generateId, getD1, getDb } from '@/lib/db';
import { couponSchema } from '@/lib/validations/admin';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json({
        success: true,
        data: {
          coupons: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });
    }

    const db = getDb(d1);
    const condition = search
      ? ilike(coupons.code, `%${search}%`)
      : undefined;
    const countRow = await db
      .select({ count: count() })
      .from(coupons)
      .where(condition)
      .get();
    const total = countRow?.count || 0;
    const rows = await db
      .select()
      .from(coupons)
      .where(condition)
      .orderBy(desc(coupons.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return NextResponse.json({
      success: true,
      data: {
        coupons: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    if (
      error?.message?.includes('no such table') ||
      error?.cause?.message?.includes('no such table')
    ) {
      return NextResponse.json({
        success: true,
        data: {
          coupons: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });
    }
    console.error('Coupons list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
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

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 },
      );
    }

    const id = generateId('cpn');
    await db.insert(coupons).values({
      id,
      code,
      type: data.type,
      value: data.value,
      minOrder: data.minOrder,
      maxUses: data.maxUses,
      appliesTo: data.appliesTo,
      active: data.active,
      startsAt: data.startsAt || null,
      expiresAt: data.expiresAt || null,
    });

    return NextResponse.json(
      { success: true, data: { id } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Coupon create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 },
    );
  }
}
