"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/admin/confirm-dialog";
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
  adminDelete,
  adminFetch,
  adminPatch,
} from "@/lib/admin-api";
import type { Subscriber } from "@/lib/db/schema";
import { cn, formatDate } from "@/lib/utils";

interface SubscribersData {
  subscribers: Subscriber[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
const sourceColors: Record<string, string> = {
  checkout: "bg-green-100 text-green-800",
  popup: "bg-blue-100 text-blue-800",
  footer: "bg-purple-100 text-purple-800",
  exit_popup: "bg-amber-100 text-amber-800",
};
const sourceOptions = [
  ["_all", "All Sources"],
  ["checkout", "Checkout"],
  ["popup", "Popup"],
  ["footer", "Footer"],
  ["exit_popup", "Exit Popup"],
];

export default function AdminSubscribersPage() {
  const client = useQueryClient();
  const confirm = useConfirm();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [input, setInput] = React.useState("");
  const [source, setSource] = React.useState("");
  const { data, isLoading, error, refetch } = useQuery<SubscribersData>({
    queryKey: ["subscribers", { page, search, source }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (source) params.set("source", source);
      return adminFetch(`/api/admin/subscribers?${params}`);
    },
  });
  const rows = data?.subscribers ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };
  const update = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminPatch(`/api/admin/subscribers/${id}`, { isActive }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["subscribers"] }); toast.success("Subscriber updated"); },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDelete(`/api/admin/subscribers/${id}`),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["subscribers"] }); toast.success("Subscriber deleted"); },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  const handleDelete = async (subscriber: Subscriber) => {
    if (await confirm({ description: `Delete subscriber "${subscriber.email}"? This cannot be undone.`, variant: "destructive", confirmLabel: "Delete" })) remove.mutate(subscriber.id);
  };
  const exportCsv = () => {
    if (!rows.length) return toast.error("No subscribers to export");
    const text = ["Email,Name,Phone,Source,Active,Subscribed At", ...rows.map((row) => [row.email, row.name || "", row.phone || "", row.source || "", row.isActive ? "Yes" : "No", row.subscribedAt || ""].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`; anchor.click(); URL.revokeObjectURL(url); toast.success(`Exported ${rows.length} subscribers`);
  };
  if (isLoading && !rows.length) return <div className="flex min-h-[400px] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6" />Subscribers</h1><p className="text-sm text-muted-foreground">{pagination.total} total subscribers</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={exportCsv} disabled={isLoading || !rows.length}><Download className="mr-2 h-4 w-4" />Export CSV</Button><Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}><RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /></Button></div>
      </div>
      <div className="rounded-xl border bg-background p-4"><div className="flex flex-col gap-4 md:flex-row"><form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(input); setPage(1); }}><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" placeholder="Search by email, name, or phone..." value={input} onChange={(event) => setInput(event.target.value)} /></div><Button type="submit" disabled={isLoading}>Search</Button></form><Select value={source || "_all"} onValueChange={(value) => { setSource(value === "_all" ? "" : value); setPage(1); }}><SelectTrigger className="min-w-[150px]"><SelectValue /></SelectTrigger><SelectContent>{sourceOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div>
      {error ? <div className="rounded-xl border bg-background py-12 text-center"><p className="mb-4 text-destructive">{error.message}</p><Button onClick={() => refetch()}>Try Again</Button></div> : (
        <div className="overflow-hidden rounded-lg border"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-muted/50">{["Email","Name","Phone","Source","Status","Subscribed",""].map((label) => <th key={label} className="p-3 text-left text-sm font-medium text-muted-foreground">{label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id} className="border-b last:border-0"><td className="p-3 text-sm font-medium">{row.email}</td><td className="p-3 text-sm">{row.name || "—"}</td><td className="p-3 text-sm">{row.phone || "—"}</td><td className="p-3"><span className={cn("rounded-full px-2 py-1 text-xs capitalize", sourceColors[row.source || ""] || "bg-gray-100 text-gray-500")}>{row.source || "—"}</span></td><td className="p-3 text-sm">{row.isActive ? "Active" : "Inactive"}</td><td className="p-3 text-sm text-muted-foreground">{row.subscribedAt ? formatDate(row.subscribedAt) : "—"}</td><td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="sm" title={row.isActive ? "Deactivate" : "Activate"} onClick={() => update.mutate({ id: row.id, isActive: !row.isActive })}>{row.isActive ? <UserRoundCheck className="h-4 w-4 text-green-600" /> : <UserRoundX className="h-4 w-4 text-gray-400" />}</Button><Button variant="ghost" size="sm" onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td></tr>) : <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No results found.</td></tr>}</tbody></table></div></div>
      )}
      {pagination.totalPages > 1 ? <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div> : null}
    </div>
  );
}
