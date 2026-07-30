'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Copy,
  Loader2,
  Pencil,
  Plus,
  Rocket,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminDelete,
  adminFetch,
  adminPost,
} from '@/lib/admin-api';

import type { ProductRecord } from '../_types';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  const duplicate = useMutation({
    mutationFn: (product: ProductRecord) =>
      adminPost<{ id: string }>('/api/admin/content/products', {
        name: `${product.name} Copy`,
        nameUr: product.nameUr,
        slug: `${product.slug}-copy`,
        sku: product.sku ? `${product.sku}-COPY` : null,
        data: product.parsedData || {},
        active: false,
        sortOrder: product.sortOrder,
      }),
    onSuccess: ({ id }) => {
      toast.success('Product duplicated. Review and publish when ready.');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      window.location.href = `/backoffice/content/products/${id}`;
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to duplicate product'),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      adminDelete(`/api/admin/content/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to delete product'),
  });
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data || []).filter(
      (product) =>
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term),
    );
  }, [products.data, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage product pricing, packages, and payment methods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/backoffice/content/products/new?mode=wizard">
              <Rocket className="mr-2 h-4 w-4" /> Launch Wizard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/backoffice/content/products/new">
              <Plus className="mr-2 h-4 w-4" /> New Product
            </Link>
          </Button>
        </div>
      </div>
      {products.error ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {products.error.message}
        </div>
      ) : null}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>
      {products.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Packages</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {product.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {Object.keys(product.parsedData?.packages || {}).length}{' '}
                    packages
                  </td>
                  <td className="px-4 py-3">
                    {product.active ? 'Active' : 'Draft'}
                  </td>
                  <td className="px-4 py-3">
                    {product.parsedData?.preorderEnabled
                      ? 'Pre-order'
                      : 'In Stock'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate"
                        onClick={() => duplicate.mutate(product)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/backoffice/content/products/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Delete this product? This cannot be undone.',
                            )
                          )
                            remove.mutate(product.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
