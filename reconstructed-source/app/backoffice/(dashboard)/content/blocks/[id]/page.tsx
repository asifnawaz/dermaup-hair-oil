'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Copy,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SavingIndicator } from '@/components/admin/form-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  adminDelete,
  adminFetch,
  adminPost,
  adminPut,
} from '@/lib/admin-api';
import {
  useKeyboardSave,
  useUnsavedChanges,
} from '@/lib/hooks/use-unsaved-changes';

import type { ContentBlockRecord, ProductRecord } from '../../_types';
import { BlockContentEditor } from '../_block-content-editor';

export default function EditContentBlockPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState('');
  const [productId, setProductId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [data, setData] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const block = useQuery({
    queryKey: ['block', id],
    queryFn: () =>
      adminFetch<ContentBlockRecord>(`/api/admin/content/blocks/${id}`),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  useEffect(() => {
    if (!block.data) return;
    setSlug(block.data.slug);
    setProductId(block.data.productId || '');
    setSortOrder(block.data.sortOrder);
    setActive(block.data.active);
    setData(
      Object.fromEntries(
        Object.entries(block.data.parsedData || {}).map(([key, value]) => [
          key,
          String(value ?? ''),
        ]),
      ),
    );
    setDirty(false);
  }, [block.data]);
  useUnsavedChanges(dirty);
  const save = useMutation({
    mutationFn: () =>
      adminPut(`/api/admin/content/blocks/${id}`, {
        slug,
        productId: productId || null,
        sortOrder,
        active,
        data,
      }),
    onSuccess: () => {
      toast.success('Block saved successfully');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to save'),
  });
  const saveBlock = useCallback(() => {
    if (!save.isPending) save.mutate();
  }, [save]);
  useKeyboardSave(saveBlock);
  const remove = useMutation({
    mutationFn: () => adminDelete(`/api/admin/content/blocks/${id}`),
    onSuccess: () => {
      toast.success('Block deleted');
      router.push('/backoffice/content/blocks');
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to delete'),
  });
  const duplicate = useMutation({
    mutationFn: () =>
      adminPost<{ id: string }>('/api/admin/content/blocks', {
        type: block.data?.type,
        slug: `${slug}-copy`,
        productId: productId || null,
        data,
        active: false,
        sortOrder,
      }),
    onSuccess: ({ id: nextId }) => {
      toast.success('Block duplicated');
      router.push(`/backoffice/content/blocks/${nextId}`);
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to duplicate'),
  });
  const change = () => setDirty(true);

  if (block.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (!block.data)
    return <p className="py-12 text-center text-destructive">Block not found</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/backoffice/content/blocks')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Block</h1>
            {dirty ? <p className="text-xs text-yellow-600">Unsaved changes</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => duplicate.mutate()}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => {
              if (
                window.confirm(
                  'Delete this content block? This cannot be undone.',
                )
              )
                remove.mutate();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <SavingIndicator isSaving={save.isPending} />
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>
      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-medium">Settings</h3>
          <p className="text-xs text-muted-foreground">
            Block identification, product assignment, and visibility
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                change();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Select
              value={productId || '_global'}
              onValueChange={(value) => {
                setProductId(value === '_global' ? '' : value);
                change();
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_global">All Products (Global)</SelectItem>
                {(products.data || []).map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(Number(event.target.value));
                change();
              }}
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={active}
              onCheckedChange={(checked) => {
                setActive(checked);
                change();
              }}
            />
            <Label>Active</Label>
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="text-sm font-medium">Content</h3>
          <p className="text-sm text-muted-foreground">
            Fill in both English and Urdu fields for bilingual support.
          </p>
        </div>
        <BlockContentEditor
          type={block.data.type}
          value={data}
          onChange={(next) => {
            setData(next);
            change();
          }}
        />
      </section>
      <p className="text-center text-xs text-muted-foreground">
        Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl+S</kbd> to save
      </p>
    </div>
  );
}
