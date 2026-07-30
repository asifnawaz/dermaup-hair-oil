"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  OrdersTable,
  type AdminOrderRow,
} from "@/components/admin/orders-table";
import {
  StatsCards,
  type DashboardSummary,
} from "@/components/admin/stats-cards";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api";

interface DashboardStats extends DashboardSummary {
  ordersByStatus: Record<string, number>;
  ordersByPayment: Record<string, number>;
  ordersByPackage: Record<string, number>;
  revenueByPayment: Record<string, number>;
  topCities: Array<{
    city: string;
    orders: number;
    percentage: number;
  }>;
  recentOrders: AdminOrderRow[];
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = React.useState("7d");
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard", period],
    queryFn: () =>
      adminFetch(`/api/admin/dashboard/stats?period=${period}`),
  });

  if (isLoading && !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-destructive">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your store performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {stats ? <StatsCards stats={stats} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-background p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/backoffice/orders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {stats ? (
            <OrdersTable orders={stats.recentOrders} compact />
          ) : null}
        </div>
        <div className="rounded-xl border bg-background p-6">
          <h2 className="mb-4 font-semibold">Top Cities</h2>
          <div className="space-y-3">
            {stats?.topCities.slice(0, 6).map((city, index) => (
              <div key={city.city} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{city.city}</span>
                    <span className="text-muted-foreground">
                      {city.orders} ({city.percentage}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${city.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {!stats?.topCities?.length ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : null}
          </div>
        </div>
      </div>

      {stats ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Orders by Status", stats.ordersByStatus, "capitalize"],
            ["Payment Methods", stats.ordersByPayment, "uppercase"],
            ["Package Types", stats.ordersByPackage, "capitalize"],
          ].map(([title, entries, textClass]) => (
            <div
              key={title as string}
              className="rounded-xl border bg-background p-6"
            >
              <h2 className="mb-4 font-semibold">{title as string}</h2>
              <div className="space-y-2">
                {Object.entries(entries as Record<string, number>).map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className={`text-sm ${textClass as string}`}>
                        {label}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
