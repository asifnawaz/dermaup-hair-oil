"use client";

/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from exact deployed analytics page module 5282.
 */

import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import {
  ConversionFunnel,
  DailyTrendChart,
  OrderStatusChart,
  RevenueBreakdownChart,
  StatCard,
  TopCitiesChart,
  type CityData,
  type DailyData,
  type FunnelStage,
  type RevenueBreakdown,
} from "@/components/admin/analytics-charts";
import { adminFetch } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    newSubscribers: number;
    conversionRate: number;
    cartAbandonmentRate: number;
  };
  conversionFunnel: FunnelStage[];
  revenueByPackage: RevenueBreakdown[];
  revenueByPayment: RevenueBreakdown[];
  dailyTrend: DailyData[];
  topCities: CityData[];
  ordersByStatus: Record<string, number>;
}

const PERIOD_OPTIONS = [
  { value: "1d", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");
  const {
    data,
    isLoading,
    error,
  } = useQuery<AnalyticsData>({
    queryKey: ["analytics", period],
    queryFn: () =>
      adminFetch<AnalyticsData>(
        `/api/admin/analytics?period=${period}`,
      ),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="rounded-lg border bg-background px-4 py-2 text-sm"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Revenue"
          value={formatPrice(data.summary.totalRevenue)}
        />
        <StatCard
          label="Total Orders"
          value={data.summary.totalOrders.toLocaleString()}
        />
        <StatCard
          label="Completed"
          value={data.summary.completedOrders.toLocaleString()}
        />
        <StatCard
          label="Subscribers"
          value={data.summary.newSubscribers.toLocaleString()}
        />
        <StatCard
          label="Conversion Rate"
          value={`${data.summary.conversionRate}%`}
          trend={data.summary.conversionRate > 5 ? "up" : "down"}
        />
        <StatCard
          label="Cart Abandonment"
          value={`${data.summary.cartAbandonmentRate}%`}
          trend={
            data.summary.cartAbandonmentRate < 60 ? "up" : "down"
          }
        />
      </div>

      <ConversionFunnel data={data.conversionFunnel} />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueBreakdownChart
          title="Revenue by Package"
          data={data.revenueByPackage}
        />
        <RevenueBreakdownChart
          title="Revenue by Payment Method"
          data={data.revenueByPayment}
          colorScheme="payment"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DailyTrendChart data={data.dailyTrend} metric="orders" />
        <DailyTrendChart data={data.dailyTrend} metric="revenue" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopCitiesChart data={data.topCities} />
        <OrderStatusChart data={data.ordersByStatus} />
      </div>
    </div>
  );
}
