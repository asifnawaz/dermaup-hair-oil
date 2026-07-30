"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api";
import type { Order } from "@/lib/db/schema";
import { cn, formatDate, formatPrice } from "@/lib/utils";

interface CustomerDetailData {
  customer: {
    phone: string;
    name: string;
    email: string | null;
    city: string | null;
    orderCount: number;
    totalSpent: number;
    lastOrderAt: string | null;
  };
  orders: Order[];
}
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function CustomerDetailPage() {
  const { phone } = useParams<{ phone: string }>();
  const decodedPhone = decodeURIComponent(phone);
  const router = useRouter();
  const { data, isLoading } = useQuery<CustomerDetailData>({
    queryKey: ["customer", decodedPhone],
    queryFn: () => adminFetch(`/api/admin/customers/${encodeURIComponent(decodedPhone)}`),
  });
  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="py-12 text-center"><p className="mb-4 text-destructive">Customer not found</p><Button onClick={() => router.push("/backoffice/customers")}>Back to Customers</Button></div>;
  const { customer, orders } = data;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="text-2xl font-bold">{customer.name}</h1><p className="text-sm text-muted-foreground">{customer.phone}</p></div></div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border bg-background p-6"><h2 className="flex items-center gap-2 font-semibold"><User className="h-5 w-5 text-primary" />Customer Info</h2><div className="space-y-3"><p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</p>{customer.email ? <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{customer.email}</p> : null}{customer.city ? <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{customer.city}</p> : null}</div></section>
          <section className="space-y-4 rounded-xl border bg-background p-6"><h2 className="font-semibold">Summary</h2><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{customer.orderCount}</p></div><div><p className="text-sm text-muted-foreground">Total Spent</p><p className="text-2xl font-bold text-primary">{formatPrice(customer.totalSpent)}</p></div><div><p className="text-sm text-muted-foreground">Avg Order</p><p className="text-lg font-semibold">{formatPrice(Math.round(customer.totalSpent / customer.orderCount))}</p></div><div><p className="text-sm text-muted-foreground">Last Order</p><p className="text-sm font-medium">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}</p></div></div></section>
          <section className="rounded-xl border bg-background p-6"><h2 className="mb-4 font-semibold">Quick Actions</h2><Button variant="outline" className="w-full justify-start" asChild><a href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Open WhatsApp</a></Button></section>
        </div>
        <section className="rounded-xl border bg-background p-6 lg:col-span-2"><h2 className="mb-4 font-semibold">Order History</h2><div className="space-y-3">{orders.map((order) => <Link key={order.id} href={`/backoffice/orders/${order.id}`} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30"><div><p className="font-mono text-sm">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{order.createdAt ? formatDate(order.createdAt) : "—"}</p></div><div className="text-right"><p className="font-medium">{formatPrice(order.total)}</p><span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusColors[order.orderStatus || "pending"])}>{order.orderStatus}</span></div></Link>)}</div></section>
      </div>
    </div>
  );
}
