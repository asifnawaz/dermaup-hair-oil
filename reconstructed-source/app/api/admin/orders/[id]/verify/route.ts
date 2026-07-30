/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 43889.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
    if (order.paymentStatus === 'verified') {
      return NextResponse.json(
        { success: false, error: 'Payment already verified' },
        { status: 400 },
      );
    }

    await db
      .update(orders)
      .set({
        paymentStatus: 'verified',
        orderStatus: 'confirmed',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, id));
    await db.insert(orderActivity).values({
      id: generateId('act'),
      orderId: id,
      action: ORDER_ACTIONS.PAYMENT_VERIFIED,
      details: JSON.stringify({
        previousStatus: order.paymentStatus,
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
      const subject = getEmailSubject('payment_verified', updatedOrder);
      await db.insert(emailLog).values({
        id: emailLogId,
        orderId: id,
        emailType: EMAIL_TYPES.PAYMENT_VERIFIED,
        recipientEmail: updatedOrder.customerEmail,
        subject,
        status: EMAIL_STATUS.PENDING,
      });

      const emailResult = await sendOrderEmail(
        'payment_verified',
        updatedOrder,
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
          details: JSON.stringify({ emailType: 'payment_verified' }),
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
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 },
    );
  }
}
