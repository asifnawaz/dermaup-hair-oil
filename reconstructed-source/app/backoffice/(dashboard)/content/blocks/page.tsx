'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Blocks,
  Copy,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminDelete,
  adminFetch,
  adminPost,
} from '@/lib/admin-api';

import type { ContentBlockRecord, ProductRecord } from '../_types';

const TYPES = [
  ['all', 'All'],
  ['testimonial', 'Testimonials'],
  ['faq', 'FAQs'],
  ['ingredient', 'Ingredients'],
  ['before_after', 'Before/After'],
  ['benefit', 'Benefits'],
  ['how_to_use', 'How to Use'],
  ['social_proof', 'Social Proof'],
  ['inside_out_support', 'Inside-Out Support'],
];

function preview(block: ContentBlockRecord) {
  const data = block.parsedData || {};
  if (block.type === 'testimonial') {
    return `${String(data.textEn || '').slice(0, 50)}${String(data.textEn || '').length > 50 ? '…' : ''}`;
  }
  if (block.type === 'faq') return String(data.questionEn || 'Question...');
  if (block.type === 'ingredient') return String(data.name || 'Ingredient name');
  if (block.type === 'before_after')
    return String(data.customerName || 'Customer Name');
  if (block.type === 'benefit') return String(data.title || 'Benefit title');
  if (block.type === 'how_to_use') return `Step ${String(data.order || '')}`;
  if (block.type === 'social_proof') return String(data.metric || 'Metric label');
  if (block.type === 'inside_out_support')
    return String(data.headline || 'Inside-out routine support');
  return '';
}

export default function ContentBlocksPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState('all');
  const [productId, setProductId] = useState('all');
  const [search, setSearch] = useState('');
  const blocks = useQuery({
    queryKey: ['blocks', type],
    queryFn: () =>
      adminFetch<ContentBlockRecord[]>(
        type === 'all'
          ? '/api/admin/content/blocks'
          : `/api/admin/content/blocks?type=${type}`,
      ),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  const remove = useMutation({
    mutationFn: (id: string) =>
      adminDelete(`/api/admin/content/blocks/${id}`),
    onSuccess: () => {
      toast.success('Block deleted');
      void queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to delete block'),
  });
  const duplicate = useMutation({
    mutationFn: (block: ContentBlockRecord) =>
      adminPost<{ id: string }>('/api/admin/content/blocks', {
        type: block.type,
        slug: `${block.slug}-copy`,
        productId: block.productId || null,
        data: block.parsedData || {},
        active: false,
        sortOrder: block.sortOrder,
      }),
    onSuccess: () => {
      toast.success('Block duplicated');
      void queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to duplicate'),
  });
  const productNames = new Map(
    (products.data || []).map((product) => [product.id, product.name]),
  );
  const rows = useMemo(
    () =>
      (blocks.data || []).filter((block) => {
        if (productId === '_global' && block.productId) return false;
        if (
          productId !== 'all' &&
          productId !== '_global' &&
          block.productId !== productId
        )
          return false;
        return block.slug.toLowerCase().includes(search.trim().toLowerCase());
      }),
    [blocks.data, productId, search],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Blocks</h1>
          <p className="text-sm text-muted-foreground">
            Manage reusable content across products
          </p>
        </div>
        <Button asChild>
          <Link href="/backoffice/content/blocks/new">
            <Plus className="mr-2 h-4 w-4" /> New Block
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="_global">Global Only</SelectItem>
            {(products.data || []).map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by slug..."
            className="pl-9"
          />
        </div>
      </div>
      {blocks.isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border py-12">
          <Blocks className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No content blocks found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((block) => (
                <tr key={block.id}>
                  <td className="px-4 py-3 capitalize">
                    {block.type.replaceAll('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <code className="block max-w-44 truncate rounded bg-muted px-1.5 py-0.5 text-xs">
                      {block.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {block.productId
                      ? productNames.get(block.productId) || 'Unknown'
                      : 'Global'}
                  </td>
                  <td className="max-w-52 px-4 py-3">
                    <span className="block truncate text-sm text-muted-foreground">
                      {preview(block)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {block.active ? 'On' : 'Off'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" title="Edit">
                        <Link href={`/backoffice/content/blocks/${block.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate"
                        onClick={() => duplicate.mutate(block)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm('Delete this content block?')) {
                            remove.mutate(block.id);
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
