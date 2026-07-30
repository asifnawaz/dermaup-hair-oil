/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 50067.
 */

import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import {
  ORDER_ACTIONS,
  orderActivity,
  orderItems,
  orders,
  type NewOrder,
  type OrderAction,
} from '@/lib/db/schema';

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
        { success: false, error: 'Database not available' },
        { status: 500 },
      );
    }

    const db = getDb(d1);
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 },
      );
    }

    const activity = await db
      .select()
      .from(orderActivity)
      .where(eq(orderActivity.orderId, id))
      .orderBy(desc(orderActivity.createdAt))
      .all();
    const items =
      order.packageType === 'multi'
        ? await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id))
            .all()
        : [];

    return NextResponse.json({
      success: true,
      data: { order, activity, items },
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}

const updateOrderSchema = z.object({
  orderStatus: z
    .enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  paymentStatus: z.enum(['pending', 'verified', 'failed']).optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  note: z.string().optional(),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updates = updateOrderSchema.parse(body);
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 },
      );
    }

    const db = getDb(d1);
    const currentOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 },
      );
    }

    const updateData: Partial<NewOrder> = {
      updatedAt: new Date().toISOString(),
    };
    if (updates.orderStatus) {
      updateData.orderStatus = updates.orderStatus;
      if (updates.orderStatus === 'shipped') {
        updateData.shippedAt = new Date().toISOString();
      } else if (updates.orderStatus === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }
    }
    if (updates.paymentStatus) {
      updateData.paymentStatus = updates.paymentStatus;
    }
    if (updates.courierName) updateData.courierName = updates.courierName;
    if (updates.trackingNumber) {
      updateData.trackingNumber = updates.trackingNumber;
    }
    if (updates.trackingUrl) updateData.trackingUrl = updates.trackingUrl;

    await db.update(orders).set(updateData).where(eq(orders.id, id));

    let action: OrderAction = ORDER_ACTIONS.NOTE_ADDED;
    let details: Record<string, unknown> = {};
    if (updates.orderStatus) {
      // The deployed route logs the literal status, including `pending`, even
      // though the narrower historical OrderAction union omits that value.
      action = updates.orderStatus as OrderAction;
      details = {
        previousStatus: currentOrder.orderStatus,
        newStatus: updates.orderStatus,
      };
    } else if (updates.paymentStatus === 'verified') {
      action = ORDER_ACTIONS.PAYMENT_VERIFIED;
      details = { previousStatus: currentOrder.paymentStatus };
    } else if (updates.paymentStatus === 'failed') {
      action = ORDER_ACTIONS.PAYMENT_FAILED;
      details = { previousStatus: currentOrder.paymentStatus };
    }
    if (updates.note) details.note = updates.note;

    await db.insert(orderActivity).values({
      id: generateId('act'),
      orderId: id,
      action,
      details: JSON.stringify(details),
      performedBy: session.id,
    });

    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();
    return NextResponse.json({ success: true, data: { order } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 },
    );
  }
}
