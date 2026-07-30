'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Blocks,
  ExternalLink,
  FileText,
  Loader2,
  Package,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  EmptyState,
  FormFieldGroup,
  SavingIndicator,
} from '@/components/admin/form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  adminDelete,
  adminFetch,
  adminPut,
} from '@/lib/admin-api';
import {
  useKeyboardSave,
  useUnsavedChanges,
} from '@/lib/hooks/use-unsaved-changes';

import type {
  ContentBlockRecord,
  PageRecord,
  ProductData,
  ProductPackage,
  ProductRecord,
} from '../../_types';

function blankPackage(id: string, volume: string): ProductPackage {
  return {
    id,
    name: 'Starter',
    nameUr: '',
    bottles: 1,
    volume,
    supply: '1 Month',
    supplyUr: '',
    price: 0,
    originalPrice: 0,
    savings: 0,
    freeDelivery: false,
    popular: false,
  };
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [active, setActive] = useState(true);
  const [data, setData] = useState<ProductData>({ packages: {} });
  const [dirty, setDirty] = useState(false);
  const product = useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      adminFetch<ProductRecord>(`/api/admin/content/products/${id}`),
  });
  const pages = useQuery({
    queryKey: ['product-pages', id],
    queryFn: () =>
      adminFetch<PageRecord[]>(`/api/admin/content/pages?productId=${id}`),
  });
  const blocks = useQuery({
    queryKey: ['product-blocks', id],
    queryFn: () =>
      adminFetch<ContentBlockRecord[]>(
        `/api/admin/content/blocks?productId=${id}`,
      ),
  });
  useEffect(() => {
    if (!product.data) return;
    setName(product.data.name);
    setNameUr(product.data.nameUr || '');
    setSlug(product.data.slug);
    setSku(product.data.sku || '');
    setActive(product.data.active);
    setData({ packages: {}, ...(product.data.parsedData || {}) });
    setDirty(false);
  }, [product.data]);
  useUnsavedChanges(dirty);
  const markDirty = () => setDirty(true);
  const save = useMutation({
    mutationFn: () =>
      adminPut(`/api/admin/content/products/${id}`, {
        name,
        nameUr: nameUr || null,
        slug,
        sku: sku || null,
        active,
        data,
      }),
    onSuccess: () => {
      toast.success('Product saved successfully');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ['product', id] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to save'),
  });
  const saveProduct = useCallback(() => {
    if (!save.isPending) save.mutate();
  }, [save]);
  useKeyboardSave(saveProduct);
  const remove = useMutation({
    mutationFn: () => adminDelete(`/api/admin/content/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      router.push('/backoffice/content/products');
    },
  });
  const packages = data.packages || {};
  const updatePackage = (packageId: string, update: Partial<ProductPackage>) => {
    const current = packages[packageId];
    if (!current) return;
    const next = { ...current, ...update };
    if ('price' in update || 'originalPrice' in update)
      next.savings = Math.max(0, next.originalPrice - next.price);
    setData({ ...data, packages: { ...packages, [packageId]: next } });
    markDirty();
  };
  const addPackage = () => {
    let packageId = 'starter';
    let counter = 2;
    while (packages[packageId]) packageId = `package_${counter++}`;
    setData({
      ...data,
      packages: {
        ...packages,
        [packageId]: blankPackage(packageId, String(data.volume || '50ml')),
      },
    });
    markDirty();
  };

  if (product.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (!product.data)
    return <p className="py-12 text-center text-destructive">Product not found</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/backoffice/content/products')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            {dirty ? <p className="text-xs text-yellow-600">Unsaved changes</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SavingIndicator isSaving={save.isPending} />
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Quick launch actions:</span>
          <Button variant="secondary" size="sm" onClick={() => router.push(`/backoffice/content/pages/new?productId=${id}`)}>
            <FileText className="mr-1 h-3.5 w-3.5" /> Create Landing Page
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/backoffice/content/blocks/new?productId=${id}&type=testimonial`)}>
            <Blocks className="mr-1 h-3.5 w-3.5" /> Add Testimonial
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.open(`/products/${slug}`, '_blank')}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" /> Preview Product
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages ({pages.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="blocks">Blocks ({blocks.data?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          <FormFieldGroup title="Basic Info" description="Product name, identifiers, and status">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name (EN)</Label><Input value={name} onChange={(e)=>{setName(e.target.value);markDirty();}} /></div>
              <div className="space-y-2"><Label>Name (UR)</Label><Input value={nameUr} onChange={(e)=>{setNameUr(e.target.value);markDirty();}} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={slug} onChange={(e)=>{setSlug(e.target.value);markDirty();}} /></div>
              <div className="space-y-2"><Label>SKU</Label><Input value={sku} onChange={(e)=>{setSku(e.target.value);markDirty();}} /></div>
            </div>
            <div className="space-y-2"><Label>Volume</Label><Input className="max-w-xs" value={String(data.volume || '')} onChange={(e)=>{setData({...data,volume:e.target.value});markDirty();}} placeholder="e.g. 50ml" /></div>
            <div className="flex items-center gap-2"><Switch checked={active} onCheckedChange={(value)=>{setActive(value);markDirty();}} /><Label>Active</Label></div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center gap-2"><Switch checked={Boolean(data.preorderEnabled)} onCheckedChange={(value)=>{setData({...data,preorderEnabled:value});markDirty();}} /><Label>Enable Pre-order</Label></div>
              {data.preorderEnabled ? <div className="mt-3 grid grid-cols-2 gap-3"><Input value={String(data.preorderNote||'')} onChange={(e)=>{setData({...data,preorderNote:e.target.value});markDirty();}} placeholder="Dispatch starts in 2-3 weeks" /><Input value={String(data.preorderNoteUr||'')} onChange={(e)=>{setData({...data,preorderNoteUr:e.target.value});markDirty();}} placeholder="ترسیل 2-3 ہفتوں میں شروع ہوگی" /></div> : null}
            </div>
          </FormFieldGroup>
          <FormFieldGroup title="Description" description="Product descriptions for SEO and marketing">
            <div className="space-y-2"><Label>Description (EN)</Label><Textarea rows={3} value={String(data.description||'')} onChange={(e)=>{setData({...data,description:e.target.value});markDirty();}} /></div>
            <div className="space-y-2"><Label>Description (UR)</Label><Textarea rows={3} value={String(data.descriptionUr||'')} onChange={(e)=>{setData({...data,descriptionUr:e.target.value});markDirty();}} /></div>
          </FormFieldGroup>
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><h2 className="font-semibold">Packages</h2><Badge variant="secondary">{Object.keys(packages).length}</Badge></div>
              <Button variant="outline" size="sm" onClick={addPackage}><Plus className="mr-1 h-4 w-4" /> Add Package</Button>
            </div>
            {Object.entries(packages).map(([packageId, item]) => (
              <div key={packageId} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between"><strong className="text-sm">{item.name || 'Unnamed'}</strong><Button variant="ghost" size="sm" className="text-destructive" onClick={()=>{const next={...packages};delete next[packageId];setData({...data,packages:next});markDirty();}}><Trash2 className="h-4 w-4" /></Button></div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div><Label className="text-xs">Name (EN)</Label><Input value={item.name} onChange={(e)=>updatePackage(packageId,{name:e.target.value})} /></div>
                  <div><Label className="text-xs">Price (PKR)</Label><Input type="number" value={item.price} onChange={(e)=>updatePackage(packageId,{price:Number(e.target.value)})} /></div>
                  <div><Label className="text-xs">Original Price</Label><Input type="number" value={item.originalPrice} onChange={(e)=>updatePackage(packageId,{originalPrice:Number(e.target.value)})} /></div>
                  <div><Label className="text-xs">Bottles</Label><Input type="number" value={item.bottles} onChange={(e)=>updatePackage(packageId,{bottles:Number(e.target.value)})} /></div>
                </div>
                <div className="flex gap-6"><label className="flex items-center gap-2 text-xs"><Switch checked={item.freeDelivery} onCheckedChange={(value)=>updatePackage(packageId,{freeDelivery:value})} /> Free Delivery</label><label className="flex items-center gap-2 text-xs"><Switch checked={Boolean(item.popular)} onCheckedChange={(value)=>updatePackage(packageId,{popular:value})} /> Popular Badge</label></div>
              </div>
            ))}
            {Object.keys(packages).length === 0 ? <EmptyState icon={<Package className="h-10 w-10" />} title="No packages yet" description="Add your first package to define pricing options for this product." /> : null}
          </div>
        </TabsContent>
        <TabsContent value="pages" className="mt-6 space-y-3">
          {(pages.data || []).map((page) => <Button key={page.id} variant="outline" className="w-full justify-between" onClick={()=>router.push(`/backoffice/content/pages/${page.id}`)}><span>{page.title} <code className="ml-2 text-xs">{page.slug}</code></span><Badge>{page.active?'Active':'Draft'}</Badge></Button>)}
          {!pages.data?.length ? <EmptyState icon={<FileText className="h-10 w-10" />} title="No linked pages" description="Create a landing page to showcase this product." /> : null}
        </TabsContent>
        <TabsContent value="blocks" className="mt-6 space-y-3">
          {(blocks.data || []).map((block) => <Button key={block.id} variant="outline" className="w-full justify-between" onClick={()=>router.push(`/backoffice/content/blocks/${block.id}`)}><span className="capitalize">{block.type.replaceAll('_',' ')} <code className="ml-2 text-xs">{block.slug}</code></span><Badge>{block.active?'On':'Off'}</Badge></Button>)}
          {!blocks.data?.length ? <EmptyState icon={<Blocks className="h-10 w-10" />} title="No content blocks" description="Add testimonials, FAQs, ingredients, and other content blocks." /> : null}
        </TabsContent>
      </Tabs>
      <div className="flex justify-end border-t pt-4"><Button variant="ghost" className="text-destructive" onClick={()=>{if(window.confirm('Delete this product? This cannot be undone.')) remove.mutate();}}><Trash2 className="mr-2 h-4 w-4" /> Delete Product</Button></div>
    </div>
  );
}
