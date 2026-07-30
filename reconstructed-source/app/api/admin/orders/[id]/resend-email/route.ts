/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 37964.
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
  type EmailType as SchemaEmailType,
} from '@/lib/db/schema';
import {
  getEmailSubject,
  sendOrderEmail,
  type EmailType,
} from '@/lib/email';

type RouteContext = { params: Promise<{ id: string }> };

const resendEmailSchema = z.object({
  emailType: z.enum([
    'order_confirmation',
    'payment_verified',
    'order_shipped',
    'delivery_reminder',
    'post_delivery',
  ]),
});

const emailTypeMap: Record<EmailType, SchemaEmailType> = {
  order_confirmation: EMAIL_TYPES.ORDER_CONFIRMATION,
  payment_verified: EMAIL_TYPES.PAYMENT_VERIFIED,
  order_shipped: EMAIL_TYPES.ORDER_SHIPPED,
  delivery_reminder: EMAIL_TYPES.DELIVERY_REMINDER,
  post_delivery: EMAIL_TYPES.POST_DELIVERY,
};

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
    const { emailType } = resendEmailSchema.parse(body);
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

    const emailLogId = generateId('email');
    const subject = getEmailSubject(emailType, order);
    await db.insert(emailLog).values({
      id: emailLogId,
      orderId: id,
      emailType: emailTypeMap[emailType],
      recipientEmail: order.customerEmail,
      subject,
      status: EMAIL_STATUS.PENDING,
    });

    const emailResult = await sendOrderEmail(emailType, order);
    if (emailResult.success) {
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
        details: JSON.stringify({ emailType, resent: true }),
        performedBy: session.id,
      });

      return NextResponse.json({
        success: true,
        data: { messageId: emailResult.messageId },
      });
    }

    await db
      .update(emailLog)
      .set({
        status: EMAIL_STATUS.FAILED,
        errorMessage: emailResult.error,
      })
      .where(eq(emailLog.id, emailLogId));
    return NextResponse.json(
      {
        success: false,
        error: emailResult.error || 'Failed to send email',
      },
      { status: 500 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Resend email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend email' },
      { status: 500 },
    );
  }
}
