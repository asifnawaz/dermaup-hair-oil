"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Image as ImageIcon,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useConfirm } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminDelete, adminFetch } from "@/lib/admin-api";
import type { Media, Product } from "@/lib/db/schema";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1_048_576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1_048_576).toFixed(1)} MB`;
}

export default function MediaPage() {
  const client = useQueryClient();
  const confirm = useConfirm();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [productId, setProductId] = React.useState("_all");
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const { data: media = [], isLoading } = useQuery<Media[]>({
    queryKey: ["media", { productId }],
    queryFn: () => adminFetch(productId !== "_all" ? `/api/admin/media?productId=${productId}` : "/api/admin/media"),
  });
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => adminFetch("/api/admin/content/products"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDelete(`/api/admin/media/${id}`),
    onSuccess: () => { toast.success("Image deleted"); client.invalidateQueries({ queryKey: ["media"] }); },
    onError: () => toast.error("Failed to delete"),
  });
  const upload = async (files: FileList | File[]) => {
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is larger than 5MB`); continue; }
      try {
        const body = new FormData(); body.append("file", file); if (productId !== "_all") body.append("productId", productId);
        const response = await fetch("/api/admin/media", { method: "POST", body, credentials: "include" });
        const json = (await response.json()) as { success?: boolean; error?: string };
        if (json.success) uploaded += 1; else toast.error(`Failed to upload ${file.name}: ${json.error}`);
      } catch { toast.error(`Error uploading ${file.name}`); }
    }
    if (uploaded) { toast.success(`Uploaded ${uploaded} file${uploaded > 1 ? "s" : ""}`); client.invalidateQueries({ queryKey: ["media"] }); }
    setUploading(false);
  };
  const handleDelete = async (id: string) => {
    if (await confirm({ description: "Delete this image? This cannot be undone.", variant: "destructive", confirmLabel: "Delete" })) remove.mutate(id);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Media Library</h1><p className="text-sm text-muted-foreground">Upload and manage images</p></div><Select value={productId} onValueChange={setProductId}><SelectTrigger className="w-48"><SelectValue placeholder="Filter by product" /></SelectTrigger><SelectContent><SelectItem value="_all">All Products</SelectItem>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent></Select></div>
      <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter") inputRef.current?.click(); }} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files); }} className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}><input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(event) => event.target.files && upload(event.target.files)} />{uploading ? <div className="flex flex-col items-center gap-2"><LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" /><p className="text-sm text-muted-foreground">Uploading...</p></div> : <div className="flex flex-col items-center gap-2"><Upload className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{dragging ? "Drop files here" : "Drag & drop images here, or click to browse"}</p><p className="text-xs text-muted-foreground/60">JPG, PNG, WebP, GIF, SVG — Max 5MB</p></div>}</div>
      {isLoading ? <div className="flex h-32 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" /></div> : media.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ImageIcon className="mx-auto mb-3 h-12 w-12 opacity-30" /><p className="text-sm">No images uploaded yet</p></div> : <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{media.map((item) => <div key={item.id} className="group relative overflow-hidden rounded-lg border bg-muted/20"><div className="relative aspect-square"><img src={`/api/admin/media/${item.id}/file`} alt={item.alt || item.filename} className="h-full w-full object-cover" loading="lazy" /><div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100"><Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => { const url = `/api/admin/media/${item.id}/file`; navigator.clipboard.writeText(url); setCopiedId(item.id); setTimeout(() => setCopiedId(null), 2000); toast.success("URL copied"); }}>{copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</Button><Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div><div className="p-2"><p className="truncate text-xs font-medium">{item.filename}</p><p className="text-xs text-muted-foreground">{formatBytes(item.size)}</p></div></div>)}</div>}
    </div>
  );
}
