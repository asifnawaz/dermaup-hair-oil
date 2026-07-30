/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 68251.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import {
  EMAIL_STATUS,
  EMAIL_TYPES,
  ORDER_ACTIONS,
  emailLog,
  orderActivity,
  orders,
} from '@/lib/db/schema';
import { getEmailSubject, sendOrderEmail } from '@/lib/email';

type RouteContext = { params: Promise<{ id: string }> };

const shipOrderSchema = z.object({
  courierName: z.string().min(1, 'Courier name is required'),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  trackingUrl: z.string().url().optional(),
  expectedDeliveryDate: z.string().optional(),
});

export async function POST(request: Request, { params }: RouteContext) {
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
    const {
      courierName,
      trackingNumber,
      trackingUrl,
      expectedDeliveryDate,
    } = shipOrderSchema.parse(body);
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
    if (
      order.orderStatus === 'shipped' ||
      order.orderStatus === 'delivered'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Order already ${order.orderStatus}`,
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    await db
      .update(orders)
      .set({
        orderStatus: 'shipped',
        courierName,
        trackingNumber,
        trackingUrl: trackingUrl || null,
        shippedAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, id));
    await db.insert(orderActivity).values({
      id: generateId('act'),
      orderId: id,
      action: ORDER_ACTIONS.SHIPPED,
      details: JSON.stringify({
        previousStatus: order.orderStatus,
        courierName,
        trackingNumber,
      }),
      performedBy: session.id,
    });

    const updatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .get();
    let emailSent = false;
    let emailError: string | undefined;

    if (updatedOrder) {
      const emailLogId = generateId('email');
      const subject = getEmailSubject('order_shipped', updatedOrder);
      await db.insert(emailLog).values({
        id: emailLogId,
        orderId: id,
        emailType: EMAIL_TYPES.ORDER_SHIPPED,
        recipientEmail: updatedOrder.customerEmail,
        subject,
        status: EMAIL_STATUS.PENDING,
      });

      const emailResult = await sendOrderEmail(
        'order_shipped',
        updatedOrder,
        { trackingUrl, expectedDeliveryDate },
      );
      if (emailResult.success) {
        emailSent = true;
        await db
          .update(emailLog)
          .set({
            status: EMAIL_STATUS.SENT,
            sentAt: new Date().toISOString(),
          })
          .where(eq(emailLog.id, emailLogId));
        await db.insert(orderActivity).values({
          id: generateId('act'),
          orderId: id,
          action: ORDER_ACTIONS.EMAIL_SENT,
          details: JSON.stringify({ emailType: 'order_shipped' }),
          performedBy: 'system',
        });
      } else {
        emailError = emailResult.error;
        await db
          .update(emailLog)
          .set({
            status: EMAIL_STATUS.FAILED,
            errorMessage: emailResult.error,
          })
          .where(eq(emailLog.id, emailLogId));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        emailSent,
        emailError,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Ship order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ship order' },
      { status: 500 },
    );
  }
}
