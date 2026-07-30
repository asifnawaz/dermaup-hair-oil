import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  city?: string | null;
  total: number;
  orderStatus?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  createdAt?: string | null;
}

export interface OrdersTableProps {
  orders: AdminOrderRow[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function OrdersTable({
  orders,
  pagination,
  onPageChange,
  compact = false,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Order
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Customer
              </th>
              {!compact ? (
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">
                  City
                </th>
              ) : null}
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Total
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              {!compact ? (
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell">
                  Payment
                </th>
              ) : null}
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerPhone}
                    </p>
                  </div>
                </td>
                {!compact ? (
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-sm">{order.city}</span>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">
                    {formatPrice(order.total)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize",
                      statusColors[order.orderStatus || "pending"],
                    )}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                {!compact ? (
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase text-muted-foreground">
                        {order.paymentMethod}
                      </span>
                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          paymentStatusColors[
                            order.paymentStatus || "pending"
                          ],
                        )}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/backoffice/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * 20 + 1} to{" "}
            {Math.min(20 * pagination.page, pagination.total)} of{" "}
            {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
