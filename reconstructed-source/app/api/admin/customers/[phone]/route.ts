/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 82387.
 */

import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';

type RouteContext = { params: Promise<{ phone: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }

    const customerOrders = await getDb(d1)
      .select()
      .from(orders)
      .where(eq(orders.customerPhone, decodedPhone))
      .orderBy(desc(orders.createdAt))
      .all();

    if (customerOrders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 },
      );
    }

    const latestOrder = customerOrders[0];
    const totalSpent = customerOrders.reduce(
      (total, order) => total + order.total,
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          phone: decodedPhone,
          name: latestOrder.customerName,
          email: latestOrder.customerEmail,
          city: latestOrder.city,
          orderCount: customerOrders.length,
          totalSpent,
          lastOrderAt: latestOrder.createdAt,
        },
        orders: customerOrders,
      },
    });
  } catch (error) {
    console.error('Customer detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 },
    );
  }
}
