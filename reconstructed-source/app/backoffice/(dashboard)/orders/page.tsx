"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleX,
  Download,
  Eye,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminFetch,
  adminPost,
} from "@/lib/admin-api";
import type { Order } from "@/lib/db/schema";
import { cn, formatDate, formatPrice } from "@/lib/utils";

interface OrdersData {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
const statusOptions = [
  ["_all", "All Statuses"],
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];
const paymentStatusOptions = [
  ["_all", "All Payments"],
  ["pending", "Pending"],
  ["verified", "Verified"],
  ["failed", "Failed"],
];

const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
    ),
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.orderNumber}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.customerName}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.customerPhone}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <span className="text-sm">{row.original.city}</span>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatPrice(row.original.total)}
      </span>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize",
          statusColors[row.original.orderStatus || "pending"],
        )}
      >
        {row.original.orderStatus}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase text-muted-foreground">
          {row.original.paymentMethod}
        </span>
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            paymentStatusColors[row.original.paymentStatus || "pending"],
          )}
        >
          {row.original.paymentStatus}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.createdAt ? formatDate(row.original.createdAt) : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div
        className="text-right"
        onClick={(event) => event.stopPropagation()}
      >
        <Link href={`/backoffice/orders/${row.original.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
    enableSorting: false,
    size: 60,
  },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  const { data, isLoading, error, refetch } = useQuery<OrdersData>({
    queryKey: ["orders", { page, search, status, paymentStatus }],
    queryFn: () => {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      return adminFetch(`/api/admin/orders?${params}`);
    },
  });
  const rows = data?.orders ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };
  const hasFilters = Boolean(search || status || paymentStatus);

  const bulkMutation = useMutation({
    mutationFn: ({
      ids,
      action,
    }: {
      ids: string[];
      action: "confirm" | "cancel";
    }) =>
      adminPost<{ updated: number; total: number; action: string }>(
        "/api/admin/orders/bulk",
        { ids, action },
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        `${result.updated} of ${result.total} orders updated to "${result.action}"`,
      );
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  const handleBulk = async (
    selected: Order[],
    action: "confirm" | "cancel",
  ) => {
    const label = action === "confirm" ? "Confirm" : "Cancel";
    if (
      await confirm({
        description: `${label} ${selected.length} selected order(s)?`,
        confirmLabel: label,
        variant: action === "cancel" ? "destructive" : "default",
      })
    ) {
      bulkMutation.mutate({
        ids: selected.map((order) => order.id),
        action,
      });
    }
  };

  const exportCsv = () => {
    if (!rows.length) return toast.error("No orders to export");
    const content = [
      "Order ID,Customer,Phone,Email,City,Address,Package,Total,Status,Payment Method,Payment Status,Date",
      ...rows.map((order) =>
        [
          order.orderNumber,
          order.customerName,
          order.customerPhone,
          order.customerEmail || "",
          order.city,
          `"${(order.address || "").replace(/"/g, '""')}"`,
          order.packageType,
          order.total,
          order.orderStatus,
          order.paymentMethod,
          order.paymentStatus,
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "",
        ].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} orders`);
  };

  if (isLoading && rows.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={isLoading || !rows.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
          </Button>
        </div>
      </div>
      <div className="rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order #, name, or phone..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasFilters ? "border-primary" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasFilters ? (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {[search, status, paymentStatus].filter(Boolean).length}
              </span>
            ) : null}
          </Button>
        </div>
        {showFilters ? (
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Order Status
              </label>
              <Select
                value={status || "_all"}
                onValueChange={(value) => {
                  setStatus(value === "_all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Payment Status
              </label>
              <Select
                value={paymentStatus || "_all"}
                onValueChange={(value) => {
                  setPaymentStatus(value === "_all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasFilters ? (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setStatus("");
                    setPaymentStatus("");
                    setPage(1);
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-xl border bg-background py-12 text-center">
          <p className="mb-4 text-destructive">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          enableRowSelection
          onRowClick={(order) =>
            router.push(`/backoffice/orders/${order.id}`)
          }
          serverPagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            onPageChange: setPage,
          }}
          bulkActions={(selected) => (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={bulkMutation.isPending}
                onClick={() => handleBulk(selected, "confirm")}
              >
                <Check className="mr-1 h-4 w-4" />
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={bulkMutation.isPending}
                className="border-destructive/30 text-destructive"
                onClick={() => handleBulk(selected, "cancel")}
              >
                <CircleX className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        />
      )}
    </div>
  );
}
