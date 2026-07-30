/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed /api/orders route module and reconciled
 * with the older source index. When evidence differs, this file follows the
 * deployed Worker, notably its random DU-XXXX-XXXX order numbers.
 */

import { and, eq, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  normalizeCheckoutConfig,
  safeParseSettingJson,
} from '@/lib/checkout-config';
import { validateCouponCode } from '@/lib/coupons';
import { generateId, getD1, getDb } from '@/lib/db';
import {
  coupons,
  orderItems,
  orders,
  products,
  siteSettings,
} from '@/lib/db/schema';
import { formatZodErrors } from '@/lib/validators';

// The production optimizer inlined this helper. The implementation below is
// the exact deployed algorithm, rather than the unrelated sequential helper.
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = new Uint8Array(8);

  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return `DU-${code.slice(0, 4)}-${code.slice(4)}`;
}

const multiProductOrderSchema = z.object({
  customerName: z.string().min(3).max(100),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().min(11),
  city: z.string().min(1),
  address: z.string().min(10).max(500),
  paymentMethod: z.string().min(1).max(50),
  language: z.enum(['en', 'ur']).default('en'),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        packageType: z.string(),
        quantity: z.number().min(1).max(10),
      }),
    )
    .min(1),
});

type DbClient = ReturnType<typeof getDb>;
type OrderInsert = typeof orders.$inferInsert;

async function getCanonicalCheckoutConfig(db: DbClient) {
  const [checkoutRow, paymentMethodsRow] = await Promise.all([
    db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'checkout_config'))
      .get(),
    db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'payment_methods'))
      .get(),
  ]);

  return normalizeCheckoutConfig(
    safeParseSettingJson(checkoutRow?.value),
    safeParseSettingJson(paymentMethodsRow?.value),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 },
      );
    }

    const db = getDb(d1);
    const validationResult = multiProductOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(validationResult.error),
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    if (data.paymentMethod === 'cod') {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      const recentOrder = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.customerPhone, data.customerPhone),
            sql`${orders.createdAt} > ${thirtyMinutesAgo}`,
          ),
        )
        .get();

      if (recentOrder) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please wait before placing another order',
          },
          { status: 429 },
        );
      }
    }

    const checkoutConfig = await getCanonicalCheckoutConfig(db);
    const paymentMethodConfig =
      checkoutConfig.paymentMethods[data.paymentMethod];

    if (!paymentMethodConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method' },
        { status: 400 },
      );
    }

    const packageCache = new Map<
      string,
      {
        slug: string;
        name: string;
        packagesByType: Record<string, unknown>;
        isPreorder: boolean;
      }
    >();
    const resolvedItems: {
      productId: string;
      productSlug: string;
      productName: string;
      packageType: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of data.items) {
      let product = packageCache.get(item.productId);

      if (!product) {
        const productRow = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .get();

        if (!productRow?.data) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid product in cart: ${item.productId}`,
            },
            { status: 400 },
          );
        }

        const parsedData = safeParseSettingJson(productRow.data);
        const productData =
          parsedData && typeof parsedData === 'object'
            ? (parsedData as Record<string, unknown>)
            : {};
        const packagesByType =
          productData.packages && typeof productData.packages === 'object'
            ? (productData.packages as Record<string, unknown>)
            : {};

        product = {
          slug: productRow.slug,
          name: productRow.name,
          packagesByType,
          isPreorder: Boolean(productData.preorderEnabled),
        };
        packageCache.set(item.productId, product);
      }

      const packageConfig = product.packagesByType[item.packageType];

      if (!packageConfig || typeof packageConfig !== 'object') {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid package for product: ${product.name}`,
          },
          { status: 400 },
        );
      }

      const packagePrice = (packageConfig as Record<string, unknown>).price;
      const unitPrice =
        typeof packagePrice === 'number' ? Math.round(packagePrice) : null;

      if (unitPrice === null || unitPrice < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid package pricing for product: ${product.name}`,
          },
          { status: 400 },
        );
      }

      resolvedItems.push({
        productId: item.productId,
        productSlug: product.slug,
        productName: product.isPreorder
          ? `[Pre-order] ${product.name}`
          : product.name,
        packageType: item.packageType,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      });
    }

    const subtotal = resolvedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const quantity = resolvedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const isCod = data.paymentMethod === 'cod';
    const codDeliveryFee = checkoutConfig.codDeliveryFee;
    const configuredDeliveryFee = Math.max(
      0,
      Math.round(paymentMethodConfig.deliveryFee || 0),
    );
    const deliveryFee = isCod
      ? subtotal >= checkoutConfig.freeShippingThreshold
        ? 0
        : codDeliveryFee
      : configuredDeliveryFee;
    const prepaidDiscount = isCod
      ? 0
      : Math.round(
          subtotal * (checkoutConfig.prepaidDiscountPercent / 100),
        );
    const couponResult = data.couponCode
      ? await validateCouponCode(db, data.couponCode, subtotal)
      : null;

    if (couponResult && !couponResult.success) {
      return NextResponse.json(
        { success: false, error: couponResult.error },
        { status: couponResult.status },
      );
    }

    const validCoupon = couponResult?.success ? couponResult.data : null;
    const couponDiscount = validCoupon?.discount || 0;
    const total = Math.max(
      0,
      subtotal + deliveryFee - couponDiscount - prepaidDiscount,
    );
    const orderId = generateId('order');
    const orderNumber = generateOrderNumber();
    const orderStatus = data.paymentMethod === 'cod' ? 'confirmed' : 'pending';
    const orderData: OrderInsert = {
      id: orderId,
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone,
      city: data.city,
      address: data.address,
      packageType: 'multi',
      quantity,
      subtotal,
      deliveryFee,
      total,
      couponCode: validCoupon?.code || null,
      couponDiscount,
      paymentMethod: data.paymentMethod as OrderInsert['paymentMethod'],
      paymentStatus: 'pending',
      orderStatus: orderStatus as OrderInsert['orderStatus'],
      language: data.language,
    };

    const orderStatements: BatchItem<'sqlite'>[] = [
      db.insert(orders).values(orderData),
      ...resolvedItems.map((item) =>
        db.insert(orderItems).values({
          id: generateId('oi'),
          orderId,
          productId: item.productId,
          productSlug: item.productSlug,
          productName: item.productName,
          packageType: item.packageType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        }),
      ),
    ];

    if (validCoupon?.code) {
      orderStatements.push(
        db
          .update(coupons)
          .set({ usedCount: sql`used_count + 1` })
          .where(eq(coupons.code, validCoupon.code)),
      );
    }

    // D1 executes batch statements atomically. Drizzle's transaction helper
    // emits BEGIN/SAVEPOINT statements, which D1 rejects at runtime.
    await db.batch(
      orderStatements as [
        BatchItem<'sqlite'>,
        ...BatchItem<'sqlite'>[],
      ],
    );

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderNumber,
        orderNumber,
        total,
        deliveryFee,
        couponDiscount,
        prepaidDiscount,
        paymentMethod: data.paymentMethod,
        status: orderStatus,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 },
  );
}
