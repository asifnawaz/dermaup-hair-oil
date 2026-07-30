/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from module 98190 in the latest deployed Cloudflare Worker and
 * cross-checked against the original source index. Error text, status codes,
 * date comparisons, rounding, and discount caps match production.
 */

import { and, eq } from 'drizzle-orm';

import type { DrizzleDB } from './db';
import { coupons } from './db/schema';

export type ValidCouponData = {
  couponId: string;
  code: string;
  type: string;
  value: number;
  discount: number;
  label: string;
  description: string;
};

export type CouponValidationResult =
  | { success: true; data: ValidCouponData }
  | { success: false; status: number; error: string };

export async function validateCouponCode(
  db: DrizzleDB,
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalizedCode = code.toUpperCase().trim();

  if (!normalizedCode) {
    return { success: false, status: 400, error: 'Coupon code is required' };
  }

  const normalizedSubtotal = Number.isFinite(subtotal)
    ? Math.max(0, Math.round(subtotal))
    : 0;
  const coupon = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, normalizedCode), eq(coupons.active, true)))
    .get();

  if (!coupon) {
    return { success: false, status: 404, error: 'Invalid coupon code' };
  }

  const now = new Date().toISOString();

  if (coupon.startsAt && now < coupon.startsAt) {
    return {
      success: false,
      status: 400,
      error: 'This coupon is not yet active',
    };
  }

  if (coupon.expiresAt && now > coupon.expiresAt) {
    return {
      success: false,
      status: 400,
      error: 'This coupon has expired',
    };
  }

  if (
    coupon.maxUses !== null &&
    (coupon.usedCount ?? 0) >= coupon.maxUses
  ) {
    return {
      success: false,
      status: 400,
      error: 'This coupon has reached its usage limit',
    };
  }

  if (coupon.minOrder && normalizedSubtotal < coupon.minOrder) {
    return {
      success: false,
      status: 400,
      error: `Minimum order of PKR ${coupon.minOrder.toLocaleString()} required`,
    };
  }

  const discount = Math.max(
    0,
    Math.min(
      coupon.type === 'percentage'
        ? Math.round(normalizedSubtotal * (coupon.value / 100))
        : coupon.value,
      normalizedSubtotal,
    ),
  );

  if (discount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'This coupon does not apply to the current order',
    };
  }

  const description =
    coupon.type === 'percentage'
      ? `${coupon.value}% off`
      : `PKR ${coupon.value.toLocaleString()} off`;

  return {
    success: true,
    data: {
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      label: description,
      description,
    },
  };
}
