"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { OrderDetail } from "@/components/admin/order-detail";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api";
import type {
  Order,
  OrderActivityLog,
  OrderItem,
} from "@/lib/db/schema";

interface OrderResponse {
  order: Order;
  activity: OrderActivityLog[];
  items: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<OrderResponse>({
    queryKey: ["order", id],
    queryFn: () => adminFetch(`/api/admin/orders/${id}`),
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
        <p className="mb-4 text-destructive">{error.message}</p>
        <Button onClick={() => router.push("/backoffice/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }
  return data ? (
    <OrderDetail
      order={data.order}
      activity={data.activity}
      items={data.items}
      onRefresh={() => {
        queryClient.invalidateQueries({ queryKey: ["order", id] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }}
    />
  ) : null;
}
