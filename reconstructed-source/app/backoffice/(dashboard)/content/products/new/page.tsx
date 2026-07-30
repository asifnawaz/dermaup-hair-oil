'use client';

import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Rocket,
  Truck,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminPost } from '@/lib/admin-api';

type Offer = { id: string; name: string; bottles: number; price: number; popular: boolean };

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizard = searchParams.get('mode') === 'wizard';
  const [name, setName] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [sku, setSku] = useState('');
  const [volume, setVolume] = useState('50ml');
  const [price, setPrice] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([
    { id: 'starter', name: 'Starter', bottles: 1, price: 0, popular: false },
    { id: 'value', name: 'Value Pack', bottles: 2, price: 0, popular: true },
    { id: 'best_deal', name: 'Best Deal', bottles: 3, price: 0, popular: false },
  ]);
  const [createLanding, setCreateLanding] = useState(wizard);
  const [createBlocks, setCreateBlocks] = useState(wizard);
  useEffect(() => {
    if (!slugTouched)
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
  }, [name, slugTouched]);

  const create = useMutation({
    mutationFn: async () => {
      const packages = Object.fromEntries(
        (wizard ? offers : [offers[0]]).map((offer) => [
          offer.id,
          {
            ...offer,
            volume,
            supply: `${offer.bottles} Month${offer.bottles > 1 ? 's' : ''}`,
            supplyUr: '',
            originalPrice: offer.price,
            savings: 0,
            freeDelivery: offer.bottles > 1,
          },
        ]),
      );
      const product = await adminPost<{ id: string }>(
        '/api/admin/content/products',
        {
          name,
          nameUr: nameUr || null,
          slug,
          sku: sku || null,
          data: { volume, description: '', descriptionUr: '', packages },
          active: true,
          sortOrder: 0,
        },
      );
      if (createLanding) {
        await adminPost('/api/admin/content/pages', {
          title: `${name} Landing Page`,
          slug: `${slug}-landing`,
          productId: product.id,
          template: 'product-landing',
          active: true,
          meta: {},
        });
      }
      if (createBlocks) {
        const definitions = [
          ['testimonial', `${slug}-testimonial-1`, { name: 'Customer 1', city: 'Karachi', rating: '5', textEn: 'Add real customer proof for testimonial 1.' }],
          ['faq', `${slug}-faq-1`, { questionEn: 'Add FAQ question 1', answerEn: 'Add an objection-handling answer to support conversions.' }],
          ['benefit', `${slug}-benefit-1`, { title: 'Clinically-Inspired Formula', description: 'Add a one-line product advantage backed by evidence.', icon: 'shield' }],
        ];
        for (const [type, blockSlug, data] of definitions)
          await adminPost('/api/admin/content/blocks', {
            type,
            slug: blockSlug,
            productId: product.id,
            data,
            active: true,
          });
      }
      return product;
    },
    onSuccess: ({ id }) => {
      toast.success(
        wizard ? 'Product launch scaffold created' : 'Product created — now add packages and pricing',
      );
      router.push(`/backoffice/content/products/${id}`);
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to create product'),
  });
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !slug.trim()) return toast.error('Name and slug are required');
    create.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">New Product</h1>
      </div>
      <div className="rounded-lg border bg-muted/20 p-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          {wizard ? <Rocket className="h-4 w-4" /> : null}
          {wizard ? 'Product Launch Wizard' : 'Quick Create'}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Basic Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (EN)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. UpDerma Advanced Hair Growth Oil" />
            </div>
            <div className="space-y-2">
              <Label>Name (UR)</Label>
              <Input value={nameUr} onChange={(e) => setNameUr(e.target.value)} placeholder="e.g. اپ ڈرما ایڈوانسڈ ہیئر گروتھ آئل" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. upderma-002" />
            </div>
            <div className="space-y-2">
              <Label>Volume</Label>
              <Input value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="e.g. 50ml" />
            </div>
          </div>
          {!wizard ? (
            <div className="space-y-2">
              <Label>Starting Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">PKR</span>
                <Input type="number" value={price} onChange={(e) => { const next=Number(e.target.value); setPrice(next); setOffers((all)=>all.map((o,i)=>i===0?{...o,price:next}:o)); }} className="pl-12 font-mono tabular-nums" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {offers.map((offer, index) => (
                <div key={offer.id} className={`space-y-2 rounded-md border p-3 ${offer.popular ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <Label>{offer.name} Price (PKR)</Label>
                  <Input type="number" value={offer.price} className="font-mono" onChange={(e) => setOffers((all)=>all.map((item,i)=>i===index?{...item,price:Number(e.target.value)}:item))} />
                  {offer.popular ? <span className="text-[10px] font-medium text-primary">Popular</span> : null}
                </div>
              ))}
            </div>
          )}
        </section>
        {wizard ? (
          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Assets</h3>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span><span className="flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> Product Landing Page</span><span className="text-xs text-muted-foreground">Template page linked to this product.</span></span>
              <Switch checked={createLanding} onCheckedChange={setCreateLanding} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span><span className="flex items-center gap-1 text-sm font-medium"><Truck className="h-4 w-4" /> Starter Conversion Blocks</span><span className="text-xs text-muted-foreground">Testimonials, FAQs, and benefit blocks.</span></span>
              <Switch checked={createBlocks} onCheckedChange={setCreateBlocks} />
            </div>
          </section>
        ) : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {wizard ? 'Create Launch Scaffold' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
