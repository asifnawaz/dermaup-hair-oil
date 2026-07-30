'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminDelete, adminFetch } from '@/lib/admin-api';

import type { PageRecord, ProductRecord } from '../_types';

export default function AdminPagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const pages = useQuery({
    queryKey: ['pages'],
    queryFn: () => adminFetch<PageRecord[]>('/api/admin/content/pages'),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });

  const deletePage = useMutation({
    mutationFn: (id: string) =>
      adminDelete(`/api/admin/content/pages/${id}`),
    onSuccess: () => {
      toast.success('Page deleted');
      void queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to delete page'),
  });

  const productNames = new Map(
    (products.data || []).map((product) => [product.id, product.name]),
  );
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pages.data || [];
    return (pages.data || []).filter(
      (page) =>
        page.title.toLowerCase().includes(term) ||
        page.slug.toLowerCase().includes(term),
    );
  }, [pages.data, search]);

  if (pages.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage landing pages with configurable sections
          </p>
        </div>
        <Button asChild>
          <Link href="/backoffice/content/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pages..."
          className="pl-9"
        />
      </div>

      {pages.error ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="mb-3 text-destructive">{pages.error.message}</p>
          <Button onClick={() => pages.refetch()}>Try Again</Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border py-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="font-medium">No pages found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a landing page to begin building your storefront.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((page) => (
                <tr key={page.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <span className="font-medium">{page.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {page.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {page.productId ? (
                      <span className="text-xs">
                        {productNames.get(page.productId) || 'Unknown'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        page.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {page.active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" title="Preview">
                        <a
                          href={
                            page.slug === 'home'
                              ? '/'
                              : `/pages/${page.slug}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm" title="Edit">
                        <Link href={`/backoffice/content/pages/${page.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                        disabled={deletePage.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${page.title}"? This cannot be undone.`,
                            )
                          ) {
                            deletePage.mutate(page.id);
                          }
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
