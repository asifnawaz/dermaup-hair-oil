"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LoaderCircle,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminDelete, adminFetch, adminPost } from "@/lib/admin-api";
import { cn, formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  lastLogin: string | null;
  createdAt: string | null;
}

export default function AdminUsersPage() {
  const client = useQueryClient();
  const confirm = useConfirm();
  const [showForm, setShowForm] = React.useState(false);
  const { data = [], isLoading, error, refetch } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => adminFetch("/api/admin/users"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDelete(`/api/admin/users/${id}`),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Admin user deleted"); },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  const handleDelete = async (user: AdminUser) => {
    if (await confirm({ description: `Delete admin "${user.name}" (${user.email})? This cannot be undone.`, variant: "destructive", confirmLabel: "Delete" })) remove.mutate(user.id);
  };
  if (isLoading) return <div className="flex min-h-[400px] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><Shield className="h-6 w-6" />Admin Users</h1><p className="text-sm text-muted-foreground">Manage administrator accounts (super admin only)</p></div><div className="flex gap-2"><Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Admin</>}</Button><Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button></div></div>
      {showForm ? <CreateAdminForm onSuccess={() => { setShowForm(false); client.invalidateQueries({ queryKey: ["admin-users"] }); }} /> : null}
      {error ? <div className="rounded-xl border bg-background py-12 text-center"><p className="mb-4 text-destructive">{error.message}</p><Button onClick={() => refetch()}>Try Again</Button></div> : (
        <div className="overflow-hidden rounded-lg border"><table className="w-full"><thead><tr className="border-b bg-muted/50">{["Name","Email","Role","Last Login","Created",""].map((label) => <th key={label} className="p-3 text-left text-sm font-medium text-muted-foreground">{label}</th>)}</tr></thead><tbody>{data.map((admin) => <tr key={admin.id} className="border-b last:border-0"><td className="p-3"><div className="flex items-center gap-2">{admin.role === "super_admin" ? <Shield className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}<span className="text-sm font-medium">{admin.name}</span></div></td><td className="p-3 text-sm">{admin.email}</td><td className="p-3"><span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize", admin.role === "super_admin" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-700")}>{admin.role.replace("_", " ")}</span></td><td className="p-3 text-sm text-muted-foreground">{admin.lastLogin ? formatDate(admin.lastLogin) : "Never"}</td><td className="p-3 text-sm text-muted-foreground">{admin.createdAt ? formatDate(admin.createdAt) : "—"}</td><td className="p-3"><Button variant="ghost" size="sm" onClick={() => handleDelete(admin)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}

function CreateAdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "super_admin">("admin");
  const create = useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role: string }) => adminPost("/api/admin/users", body),
    onSuccess: () => { toast.success("Admin user created"); onSuccess(); },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  return (
    <form className="space-y-4 rounded-xl border bg-background p-6" onSubmit={(event) => { event.preventDefault(); if (!name || !email || !password) return toast.error("All fields are required"); create.mutate({ name, email, password, role }); }}>
      <h2 className="font-semibold">New Admin User</h2>
      <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="admin-name">Name</Label><Input id="admin-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" required /></div><div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@upderma.com" required /></div><div className="space-y-2"><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Min 6 characters" minLength={6} required /></div><div className="space-y-2"><Label>Role</Label><Select value={role} onValueChange={(value) => setRole(value as "admin" | "super_admin")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="super_admin">Super Admin</SelectItem></SelectContent></Select></div></div>
      <div className="flex justify-end"><Button type="submit" disabled={create.isPending}>{create.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Create User</Button></div>
    </form>
  );
}
