/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 96242.
 */

import { and, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';

function toD1Date(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

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
    const period = searchParams.get('period') || '7d';
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 86_400_000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 2_592_000_000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      case '7d':
      default:
        startDate = new Date(now.getTime() - 604_800_000);
        break;
    }

    const d1 = getD1();
    if (!d1) {
      return NextResponse.json({
        success: true,
        data: emptyDashboardStats(),
      });
    }

    const db = getDb(d1);
    const startDateString = toD1Date(startDate);
    const orderCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, startDateString))
      .get();
    const totalOrders = orderCountResult?.count || 0;

    const revenueResult = await db
      .select({ total: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateString),
          sql`${orders.orderStatus} != 'cancelled'`,
        ),
      )
      .get();
    const totalRevenue = revenueResult?.total || 0;

    const pendingPaymentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          sql`${orders.paymentStatus} = 'pending'`,
          sql`${orders.paymentMethod} != 'cod'`,
        ),
      )
      .get();
    const pendingPayments = pendingPaymentsResult?.count || 0;

    const pendingShipmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          sql`${orders.orderStatus} IN ('pending', 'confirmed')`,
          sql`${orders.orderStatus} != 'cancelled'`,
        ),
      )
      .get();
    const pendingShipments = pendingShipmentsResult?.count || 0;

    const statusRows = await db
      .select({
        status: orders.orderStatus,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, startDateString))
      .groupBy(orders.orderStatus)
      .all();
    const ordersByStatus = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusRows.forEach((row) => {
      if (row.status && row.status in ordersByStatus) {
        ordersByStatus[
          row.status as keyof typeof ordersByStatus
        ] = row.count;
      }
    });

    const paymentRows = await db
      .select({
        method: orders.paymentMethod,
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(${orders.total})`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateString),
          sql`${orders.orderStatus} != 'cancelled'`,
        ),
      )
      .groupBy(orders.paymentMethod)
      .all();
    const ordersByPayment = { cod: 0, easypaisa: 0, bank: 0 };
    const revenueByPayment = { cod: 0, easypaisa: 0, bank: 0 };
    paymentRows.forEach((row) => {
      if (row.method && row.method in ordersByPayment) {
        const method = row.method as keyof typeof ordersByPayment;
        ordersByPayment[method] = row.count;
        revenueByPayment[method] = row.revenue || 0;
      }
    });

    const packageRows = await db
      .select({
        packageType: orders.packageType,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startDateString),
          sql`${orders.orderStatus} != 'cancelled'`,
        ),
      )
      .groupBy(orders.packageType)
      .all();
    const ordersByPackage = { single: 0, double: 0, triple: 0 };
    packageRows.forEach((row) => {
      if (row.packageType && row.packageType in ordersByPackage) {
        ordersByPackage[
          row.packageType as keyof typeof ordersByPackage
        ] = row.count;
      }
    });

    const topCities = (
      await db
        .select({
          city: orders.city,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, startDateString),
            sql`${orders.orderStatus} != 'cancelled'`,
          ),
        )
        .groupBy(orders.city)
        .orderBy(sql`count(*) DESC`)
        .limit(10)
        .all()
    ).map((row) => ({
      city: row.city,
      orders: row.count,
      percentage:
        totalOrders > 0
          ? Math.round((row.count / totalOrders) * 100)
          : 0,
    }));
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        total: orders.total,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(10)
      .all();
    const averageOrderValue =
      totalOrders > 0
        ? Math.round(totalRevenue / totalOrders)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        pendingPayments,
        pendingShipments,
        averageOrderValue,
        ordersByStatus,
        ordersByPayment,
        ordersByPackage,
        revenueByPayment,
        topCities,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 },
    );
  }
}

function emptyDashboardStats() {
  return {
    totalOrders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    pendingShipments: 0,
    averageOrderValue: 0,
    ordersByStatus: {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    ordersByPayment: { cod: 0, easypaisa: 0, bank: 0 },
    ordersByPackage: { single: 0, double: 0, triple: 0 },
    revenueByPayment: { cod: 0, easypaisa: 0, bank: 0 },
    topCities: [],
    recentOrders: [],
  };
}
