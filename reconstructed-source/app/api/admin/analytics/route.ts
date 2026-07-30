/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 85801.
 */

import { count, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { orders, subscribers } from '@/lib/db/schema';

type FunnelResult = {
  product_views: number | string | null;
  add_to_carts: number | string | null;
  checkout_starts: number | string | null;
};

type RevenueBucket = Record<'single' | 'double' | 'triple', number>;
type PaymentBucket = Record<'cod' | 'easypaisa' | 'bank', number>;
type StatusBucket = Record<string, number>;
type CityBucket = Record<string, number>;
type DailyBucket = Record<
  string,
  { count: number; revenue: number }
>;

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
      case '90d':
        startDate = new Date(now.getTime() - 7_776_000_000);
        break;
      case '7d':
      default:
        startDate = new Date(now.getTime() - 604_800_000);
        break;
    }

    const startDateString = toD1Date(startDate);
    const d1 = getD1();
    if (!d1) {
      return NextResponse.json({
        success: true,
        data: getMockAnalyticsData(),
      });
    }

    const db = getDb(d1);
    const funnelEvents = await d1
      .prepare(
        `
        SELECT
          COUNT(DISTINCT CASE
            -- page_view is generic and co-emitted on PDPs, so unioning it here
            -- double-counts first loads when concurrent tracking requests race cookies.
            WHEN event_type = 'product_viewed' THEN session_id
          END) AS product_views,
          COUNT(DISTINCT CASE
            WHEN event_type = 'add_to_cart' THEN session_id
          END) AS add_to_carts,
          COUNT(DISTINCT CASE
            WHEN event_type IN ('initiate_checkout', 'checkout_start') THEN session_id
          END) AS checkout_starts
        FROM analytics_events
        WHERE created_at >= ?
      `,
      )
      .bind(startDateString)
      .first<FunnelResult>();

    const periodOrders = await db
      .select()
      .from(orders)
      .where(gte(orders.createdAt, startDateString))
      .all();
    const revenueByPackage: RevenueBucket = {
      single: 0,
      double: 0,
      triple: 0,
    };
    const revenueByPayment: PaymentBucket = {
      cod: 0,
      easypaisa: 0,
      bank: 0,
    };
    const cities: CityBucket = {};
    const ordersByStatus: StatusBucket = {};
    const days: DailyBucket = {};
    let totalRevenue = 0;
    let completedOrders = 0;

    periodOrders.forEach((order) => {
      if (order.packageType in revenueByPackage) {
        revenueByPackage[
          order.packageType as keyof RevenueBucket
        ] += order.total;
      }
      if (order.paymentMethod in revenueByPayment) {
        revenueByPayment[
          order.paymentMethod as keyof PaymentBucket
        ] += order.total;
      }
      cities[order.city] = (cities[order.city] || 0) + 1;

      const status = order.orderStatus || 'pending';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;

      const date = (order.createdAt || '').split(/[T ]/)[0] || 'unknown';
      if (!days[date]) days[date] = { count: 0, revenue: 0 };
      days[date].count += 1;
      days[date].revenue += order.total;
      totalRevenue += order.total;
      if (order.orderStatus === 'delivered') completedOrders += 1;
    });

    const topCities = Object.entries(cities)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([city, cityCount]) => ({
        city,
        count: cityCount,
        percentage:
          Math.round((cityCount / periodOrders.length) * 100) || 0,
      }));
    const subscriberCount = await db
      .select({ count: count() })
      .from(subscribers)
      .where(gte(subscribers.subscribedAt, startDateString))
      .get();
    const productViews = Number(funnelEvents?.product_views || 0);
    const addToCarts = Number(funnelEvents?.add_to_carts || 0);
    const checkoutStarts = Number(funnelEvents?.checkout_starts || 0);
    const placedOrders = periodOrders.length;
    const percentageOfViews = (value: number) =>
      productViews > 0
        ? Math.round((value / productViews) * 100)
        : 0;
    const conversionFunnel = [
      {
        stage: 'Product Views',
        count: productViews,
        percentage: productViews > 0 ? 100 : 0,
      },
      {
        stage: 'Added to Cart',
        count: addToCarts,
        percentage: percentageOfViews(addToCarts),
      },
      {
        stage: 'Checkout Started',
        count: checkoutStarts,
        percentage: percentageOfViews(checkoutStarts),
      },
      {
        stage: 'Orders Placed',
        count: placedOrders,
        percentage: percentageOfViews(placedOrders),
      },
    ];
    const conversionRate = productViews
      ? ((placedOrders / productViews) * 100).toFixed(1)
      : '0.0';
    const checkoutBase = checkoutStarts || placedOrders || 0;
    const cartAbandonmentRate =
      checkoutBase > 0
        ? Math.max(
            0,
            Math.min(
              100,
              ((checkoutBase - placedOrders) / checkoutBase) * 100,
            ),
          ).toFixed(1)
        : '0.0';
    const dailyTrend = Object.entries(days)
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([date, values]) => ({
        date,
        orders: values.count,
        revenue: values.revenue,
      }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          totalOrders: periodOrders.length,
          completedOrders,
          newSubscribers: subscriberCount?.count || 0,
          conversionRate: parseFloat(conversionRate),
          cartAbandonmentRate: parseFloat(cartAbandonmentRate),
        },
        conversionFunnel,
        revenueByPackage: [
          {
            name: '1 Bottle',
            value: revenueByPackage.single,
            percentage: totalRevenue
              ? Math.round(
                  (revenueByPackage.single / totalRevenue) * 100,
                )
              : 0,
          },
          {
            name: '2 Bottles',
            value: revenueByPackage.double,
            percentage: totalRevenue
              ? Math.round(
                  (revenueByPackage.double / totalRevenue) * 100,
                )
              : 0,
          },
          {
            name: '3 Bottles',
            value: revenueByPackage.triple,
            percentage: totalRevenue
              ? Math.round(
                  (revenueByPackage.triple / totalRevenue) * 100,
                )
              : 0,
          },
        ],
        revenueByPayment: [
          {
            name: 'COD',
            value: revenueByPayment.cod,
            percentage: totalRevenue
              ? Math.round((revenueByPayment.cod / totalRevenue) * 100)
              : 0,
          },
          {
            name: 'EasyPaisa',
            value: revenueByPayment.easypaisa,
            percentage: totalRevenue
              ? Math.round(
                  (revenueByPayment.easypaisa / totalRevenue) * 100,
                )
              : 0,
          },
          {
            name: 'Bank Transfer',
            value: revenueByPayment.bank,
            percentage: totalRevenue
              ? Math.round(
                  (revenueByPayment.bank / totalRevenue) * 100,
                )
              : 0,
          },
        ],
        topCities,
        ordersByStatus,
        dailyTrend,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}

function getMockAnalyticsData() {
  return {
    period: '7d',
    summary: {
      totalRevenue: 2_397_000,
      totalOrders: 856,
      completedOrders: 680,
      newSubscribers: 234,
      conversionRate: 8,
      cartAbandonmentRate: 57,
    },
    conversionFunnel: [
      { stage: 'Page Views', count: 10_000, percentage: 100 },
      { stage: 'Package Selected', count: 3_500, percentage: 35 },
      { stage: 'Checkout Started', count: 2_800, percentage: 28 },
      { stage: 'Order Submitted', count: 1_200, percentage: 12 },
      { stage: 'Order Completed', count: 800, percentage: 8 },
    ],
    revenueByPackage: [
      { name: '1 Bottle', value: 399_800, percentage: 17 },
      { name: '2 Bottles', value: 1_199_600, percentage: 50 },
      { name: '3 Bottles', value: 797_600, percentage: 33 },
    ],
    revenueByPayment: [
      { name: 'COD', value: 1_438_200, percentage: 60 },
      { name: 'EasyPaisa', value: 719_100, percentage: 30 },
      { name: 'Bank Transfer', value: 239_700, percentage: 10 },
    ],
    topCities: [
      { city: 'Karachi', count: 274, percentage: 32 },
      { city: 'Lahore', count: 240, percentage: 28 },
      { city: 'Islamabad', count: 128, percentage: 15 },
      { city: 'Rawalpindi', count: 68, percentage: 8 },
      { city: 'Faisalabad', count: 51, percentage: 6 },
      { city: 'Others', count: 95, percentage: 11 },
    ],
    ordersByStatus: {
      pending: 45,
      confirmed: 89,
      shipped: 42,
      delivered: 680,
      cancelled: 0,
    },
    dailyTrend: [
      { date: '2024-11-19', orders: 98, revenue: 274_300 },
      { date: '2024-11-20', orders: 112, revenue: 313_600 },
      { date: '2024-11-21', orders: 134, revenue: 375_200 },
      { date: '2024-11-22', orders: 145, revenue: 406_000 },
      { date: '2024-11-23', orders: 128, revenue: 358_400 },
      { date: '2024-11-24', orders: 119, revenue: 333_200 },
      { date: '2024-11-25', orders: 120, revenue: 336_000 },
    ],
  };
}
