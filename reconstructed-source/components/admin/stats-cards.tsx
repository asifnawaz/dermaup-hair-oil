import {
  AlertCircle,
  Banknote,
  CreditCard,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  pendingShipments: number;
  averageOrderValue: number;
}

export interface StatsCardsProps {
  stats: DashboardSummary;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: Array<{
    name: string;
    value: string;
    icon: LucideIcon;
    color: string;
    badge: string | null;
  }> = [
    {
      name: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: Package,
      color: "text-blue-600 bg-blue-100",
      badge: null,
    },
    {
      name: "Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: Banknote,
      color: "text-green-600 bg-green-100",
      badge: null,
    },
    {
      name: "Pending Payments",
      value: stats.pendingPayments.toString(),
      icon: CreditCard,
      color: "text-orange-600 bg-orange-100",
      badge: stats.pendingPayments > 0 ? "Action needed" : null,
    },
    {
      name: "Pending Shipments",
      value: stats.pendingShipments.toString(),
      icon: Truck,
      color: "text-purple-600 bg-purple-100",
      badge: stats.pendingShipments > 0 ? "Action needed" : null,
    },
    {
      name: "Avg Order Value",
      value: formatPrice(stats.averageOrderValue),
      icon: CreditCard,
      color: "text-cyan-600 bg-cyan-100",
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.name}
            className="rounded-xl border bg-background p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", card.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{card.name}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            </div>
            {card.badge ? (
              <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="h-3 w-3" />
                <span>{card.badge}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
