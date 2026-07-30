/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed /api/coupons/validate route module and
 * cross-checked against the surviving route signature and call evidence.
 */

import { NextRequest, NextResponse } from 'next/server';

import { validateCouponCode } from '@/lib/coupons';
import { getD1, getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = (await request.json()) as {
      code?: unknown;
      subtotal?: unknown;
    };

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 },
      );
    }

    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 },
      );
    }

    const db = getDb(d1);
    const result = await validateCouponCode(
      db,
      code,
      typeof subtotal === 'number' ? subtotal : 0,
    );

    return result.success
      ? NextResponse.json({ success: true, data: result.data })
      : NextResponse.json(
          { success: false, error: result.error },
          { status: result.status },
        );
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 },
    );
  }
}
