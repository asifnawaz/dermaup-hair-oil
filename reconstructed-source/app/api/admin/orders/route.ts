/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 67412.
 */

import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json({
        success: true,
        data: {
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
      });
    }

    const db = getDb(d1);
    const conditions: SQL[] = [];
    if (status) conditions.push(sql`${orders.orderStatus} = ${status}`);
    if (paymentStatus) {
      conditions.push(sql`${orders.paymentStatus} = ${paymentStatus}`);
    }
    if (city) conditions.push(eq(orders.city, city));
    if (search) {
      conditions.push(
        sql`(${orders.orderNumber} LIKE ${`%${search}%`} OR
          ${orders.customerName} LIKE ${`%${search}%`} OR
          ${orders.customerPhone} LIKE ${`%${search}%`})`,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(where)
      .get();
    const total = countResult?.count || 0;
    const offset = (page - 1) * limit;
    const rows = await db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return NextResponse.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
