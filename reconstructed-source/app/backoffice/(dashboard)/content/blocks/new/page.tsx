'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

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
import { adminFetch, adminPost } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

import type { ProductRecord } from '../../_types';
import { BlockContentEditor } from '../_block-content-editor';

const BLOCK_TYPES = [
  ['testimonial', 'Testimonial', 'Customer review with name, city, rating, and quote', 'This oil changed my life!'],
  ['faq', 'FAQ', 'Question and answer pair for the FAQ section', 'Q: How long until I see results? A: 4-6 weeks...'],
  ['ingredient', 'Ingredient', 'Key ingredient with name, icon, and benefit description', 'Biotin — Strengthens hair follicles'],
  ['before_after', 'Before / After', 'Transformation story with before/after images', 'Before and after photos with timeline'],
  ['benefit', 'Benefit', 'Product benefit with icon and description', 'Reduces hair fall by 80% in 30 days'],
  ['how_to_use', 'How to Use', 'Step-by-step usage instruction', 'Step 1: Apply 5-6 drops to scalp...'],
  ['social_proof', 'Social Proof', 'Trust metric or statistic', '10,000+ satisfied customers'],
  ['inside_out_support', 'Inside-Out Support', 'Product-specific routine, food, hydration, and consistency guidance', 'Hydration outside, habits inside'],
] as const;

export default function NewContentBlockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedProductId = searchParams.get('productId') || '';
  const requestedType = searchParams.get('type') || 'testimonial';
  const [type, setType] = useState(
    BLOCK_TYPES.some((item) => item[0] === requestedType)
      ? requestedType
      : 'testimonial',
  );
  const [slug, setSlug] = useState('');
  const [productId, setProductId] = useState(linkedProductId);
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => setProductId(linkedProductId), [linkedProductId]);
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  const createBlock = useMutation({
    mutationFn: () =>
      adminPost<{ id: string }>('/api/admin/content/blocks', {
        type,
        slug,
        productId: productId || null,
        data,
        active: true,
        sortOrder: 0,
      }),
    onSuccess: ({ id }) => {
      toast.success('Block created');
      router.push(`/backoffice/content/blocks/${id}`);
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to create block'),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!slug.trim()) return toast.error('Slug is required');
    createBlock.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">New Content Block</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-3">
          <Label>Block Type</Label>
          <p className="text-sm text-muted-foreground">
            Choose the type of content block you want to create. Each type has
            different fields.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.map(([value, label, description, example]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setType(value);
                  setData({});
                }}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                  type === value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'hover:border-muted-foreground/20 hover:bg-muted/30',
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {description}
                  </span>
                  <span className="mt-1 block truncate text-[10px] italic text-muted-foreground/60">
                    {example}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Settings</h3>
          {linkedProductId ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
              Linked from product editor:{' '}
              <span className="font-medium">
                {products.data?.find((item) => item.id === linkedProductId)
                  ?.name || linkedProductId}
              </span>
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ''),
                  )
                }
                placeholder="e.g. ahmad-k"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this block
              </p>
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={productId || '_global'}
                onValueChange={(value) =>
                  setProductId(value === '_global' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_global">All Products (Global)</SelectItem>
                  {(products.data || []).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign to a specific product or keep global
              </p>
            </div>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Content</h3>
            <p className="text-sm text-muted-foreground">
              Fill in the content fields. Urdu fields are optional but
              recommended for bilingual support.
            </p>
          </div>
          <BlockContentEditor type={type} value={data} onChange={setData} />
        </section>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={createBlock.isPending}>
            {createBlock.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Block
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
