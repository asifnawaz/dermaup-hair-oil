'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  LayoutTemplate,
  Loader2,
  Megaphone,
  Package,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { adminFetch, adminPost } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

import type { ProductRecord } from '../../_types';

const TEMPLATES = [
  {
    id: '',
    title: 'Blank Page',
    description: 'Start from scratch',
    icon: FileText,
  },
  {
    id: 'product-landing',
    title: 'Product Landing',
    description: 'Hero, ingredients, testimonials, pricing, FAQ, CTA',
    icon: Package,
  },
  {
    id: 'sale-campaign',
    title: 'Sale Campaign',
    description: 'Promo banner, hero, pricing, social proof, CTA',
    icon: Megaphone,
  },
  {
    id: 'content-page',
    title: 'Content Page',
    description: 'Hero, education, benefits, CTA',
    icon: LayoutTemplate,
  },
];

export default function NewPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedProductId = searchParams.get('productId') || '';
  const [template, setTemplate] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [productId, setProductId] = useState(linkedProductId);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => setProductId(linkedProductId), [linkedProductId]);
  useEffect(() => {
    if (!slugTouched) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  }, [slugTouched, title]);

  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  const createPage = useMutation({
    mutationFn: () =>
      adminPost<{ id: string }>('/api/admin/content/pages', {
        title: title.trim(),
        slug: slug.trim(),
        productId: productId || null,
        template: template || undefined,
        meta: {
          description: description.trim(),
          keywords: keywords.trim(),
        },
        active: true,
      }),
    onSuccess: ({ id }) => {
      toast.success('Page created successfully');
      router.push(`/backoffice/content/pages/${id}`);
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to create page'),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return toast.error('Slug must be lowercase with hyphens only');
    }
    createPage.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">New Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Label>Start From</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a template to pre-fill your page with common sections. You
            can always add or remove sections later.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((item) => {
              const Icon = item.icon;
              const selected = template === item.id;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setTemplate(item.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                    selected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'hover:border-muted-foreground/20 hover:bg-muted/30',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                      selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Page Details
          </h3>
          {linkedProductId ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
              Linked from product editor:{' '}
              <span className="font-medium">
                {products.data?.find((item) => item.id === linkedProductId)
                  ?.name || linkedProductId}
              </span>
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Summer Sale Landing Page"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ''),
                );
              }}
              placeholder="home"
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL: {slug === 'home' ? '/' : `/pages/${slug}`}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Select
              value={productId || '_none'}
              onValueChange={(value) =>
                setProductId(value === '_none' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No Product</SelectItem>
                {(products.data || []).map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this page to a product to load product-specific content
              blocks.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            SEO (Optional)
          </h3>
          <div className="space-y-2">
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="SEO description for this page"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Meta Keywords</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </section>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createPage.isPending}
            className="min-w-[140px]"
          >
            {createPage.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Page
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
