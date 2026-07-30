"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Eye,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api";
import { formatDate, formatPrice } from "@/lib/utils";

interface CustomerRow {
  phone: string;
  name: string;
  email: string | null;
  city: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}
interface CustomersData {
  customers: CustomerRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm">{row.original.email || "—"}</span>,
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => <span className="text-sm">{row.original.city || "—"}</span>,
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.orderCount}</span>,
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{formatPrice(row.original.totalSpent)}</span>
    ),
  },
  {
    accessorKey: "lastOrderAt",
    header: "Last Order",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.lastOrderAt ? formatDate(row.original.lastOrderAt) : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="text-right" onClick={(event) => event.stopPropagation()}>
        <Link href={`/backoffice/customers/${encodeURIComponent(row.original.phone)}`}>
          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
        </Link>
      </div>
    ),
    enableSorting: false,
    size: 60,
  },
];

export default function AdminCustomersPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [input, setInput] = React.useState("");
  const { data, isLoading, error, refetch } = useQuery<CustomersData>({
    queryKey: ["customers", { page, search }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      return adminFetch(`/api/admin/customers?${params}`);
    },
  });
  const rows = data?.customers ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };
  const exportCsv = () => {
    if (!rows.length) return toast.error("No customers to export");
    const text = [
      "Name,Phone,Email,City,Orders,Total Spent,Last Order",
      ...rows.map((row) =>
        [row.name, row.phone, row.email || "", row.city || "", row.orderCount, row.totalSpent, row.lastOrderAt || ""].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} customers`);
  };
  if (isLoading && !rows.length) {
    return <div className="flex min-h-[400px] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6" />Customers</h1>
          <p className="text-sm text-muted-foreground">{pagination.total} unique customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={isLoading || !rows.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}><RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /></Button>
        </div>
      </div>
      <div className="rounded-xl border bg-background p-4">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(input); setPage(1); }}>
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" placeholder="Search by name, phone, or email..." value={input} onChange={(event) => setInput(event.target.value)} /></div>
          <Button type="submit" disabled={isLoading}>Search</Button>
        </form>
      </div>
      {error ? (
        <div className="rounded-xl border bg-background py-12 text-center"><p className="mb-4 text-destructive">{error.message}</p><Button onClick={() => refetch()}>Try Again</Button></div>
      ) : (
        <DataTable columns={columns} data={rows} onRowClick={(row) => router.push(`/backoffice/customers/${encodeURIComponent(row.phone)}`)} serverPagination={{ page: pagination.page, totalPages: pagination.totalPages, total: pagination.total, onPageChange: setPage }} />
      )}
    </div>
  );
}
