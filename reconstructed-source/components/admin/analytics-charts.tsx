/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the original symbol index and the exact deployed analytics
 * page factory (module 5282), where these helpers were inlined by the compiler.
 */

import type { ReactNode } from "react";

import { cn, formatPrice } from "@/lib/utils";

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface RevenueBreakdown {
  name: string;
  value: number;
  percentage: number;
}

export interface CityData {
  city: string;
  count: number;
  percentage: number;
}

export interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

interface ConversionFunnelProps {
  data: FunnelStage[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const maxCount = data[0]?.count || 1;

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Conversion Funnel</h3>
      <div className="space-y-4">
        {data.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;
          return (
            <div className="relative" key={stage.stage}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{stage.stage}</span>
                <span className="text-sm text-muted-foreground">
                  {stage.count.toLocaleString()} ({stage.percentage}%)
                </span>
              </div>
              <div className="relative h-8 overflow-hidden rounded-lg bg-secondary">
                <div
                  className={cn(
                    "flex h-full items-center justify-end rounded-lg pr-3 transition-all duration-500",
                    index === 0 && "bg-primary",
                    index === 1 && "bg-blue-500",
                    index === 2 && "bg-indigo-500",
                    index === 3 && "bg-purple-500",
                    index === 4 && "bg-green-500",
                  )}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RevenueBreakdownChartProps {
  title: string;
  data: RevenueBreakdown[];
  colorScheme?: "default" | "payment";
}

export function RevenueBreakdownChart({
  title,
  data,
  colorScheme = "default",
}: RevenueBreakdownChartProps) {
  const colors =
    colorScheme === "payment"
      ? ["bg-orange-500", "bg-green-500", "bg-blue-500"]
      : ["bg-primary", "bg-blue-500", "bg-indigo-500"];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 text-2xl font-bold text-primary">
        {formatPrice(total)}
      </p>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", colors[index])} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatPrice(item.value)} ({item.percentage}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  colors[index],
                )}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopCitiesChartProps {
  data: CityData[];
}

export function TopCitiesChart({ data }: TopCitiesChartProps) {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Top Cities</h3>
      <div className="space-y-3">
        {data.map((city, index) => (
          <div className="flex items-center gap-4" key={city.city}>
            <span className="w-6 text-sm font-medium">{index + 1}.</span>
            <span className="w-24 truncate text-sm">{city.city}</span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${city.percentage}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm text-muted-foreground">
              {city.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DailyTrendChartProps {
  data: DailyData[];
  metric: "orders" | "revenue";
}

export function DailyTrendChart({
  data,
  metric,
}: DailyTrendChartProps) {
  const maxValue = Math.max(
    ...data.map((day) =>
      metric === "orders" ? day.orders : day.revenue,
    ),
  );

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">
        {metric === "orders" ? "Daily Orders" : "Daily Revenue"}
      </h3>
      <div className="flex h-48 items-end justify-between gap-2">
        {data.map((day) => {
          const value =
            metric === "orders" ? day.orders : day.revenue;
          const cleanDate = day.date.includes("T")
            ? day.date.split("T")[0]
            : day.date.split(" ")[0];
          const dateLabel = new Date(
            `${cleanDate}T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              className="flex flex-1 flex-col items-center gap-2"
              key={day.date}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-primary transition-all duration-500 hover:bg-primary/80"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                  title={`${day.date}: ${
                    metric === "orders"
                      ? day.orders
                      : formatPrice(day.revenue)
                  }`}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{value}</p>
        {subValue ? (
          <span
            className={cn(
              "text-sm",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              (!trend || trend === "neutral") &&
                "text-muted-foreground",
            )}
          >
            {subValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface OrderStatusChartProps {
  data: Record<string, number>;
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    shipped: "bg-indigo-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">
        Order Status Distribution
      </h3>
      <div className="mb-4 flex h-8 overflow-hidden rounded-lg">
        {Object.entries(data).map(([status, count]) => {
          const percentage = total ? (count / total) * 100 : 0;
          return percentage === 0 ? null : (
            <div
              className={cn(
                "h-full",
                statusColors[status] || "bg-gray-500",
              )}
              key={status}
              style={{ width: `${percentage}%` }}
              title={`${status}: ${count}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Object.entries(data).map(([status, count]) => (
          <div className="flex items-center gap-2" key={status}>
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                statusColors[status] || "bg-gray-500",
              )}
            />
            <span className="text-sm capitalize">
              {status}: <strong>{count}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
