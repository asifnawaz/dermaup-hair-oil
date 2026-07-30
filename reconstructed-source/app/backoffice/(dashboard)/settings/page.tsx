'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Database,
  Globe,
  Loader2,
  Plus,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { adminFetch, adminPut } from '@/lib/admin-api';
import {
  getDefaultStorefrontSettings,
  normalizeStorefrontSettings,
  type StorefrontSettings,
} from '@/lib/store-settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<StorefrontSettings>(
    getDefaultStorefrontSettings(),
  );
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: () =>
      adminFetch<Record<string, unknown>>('/api/admin/settings'),
  });
  useEffect(() => {
    if (query.data) setSettings(normalizeStorefrontSettings(query.data));
  }, [query.data]);
  const save = useMutation({
    mutationFn: () =>
      adminPut('/api/admin/settings', {
        payment_methods: settings.checkoutConfig.paymentMethods,
        payment_details: settings.paymentDetails,
        checkout_config: {
          codDeliveryFee: settings.checkoutConfig.codDeliveryFee,
          freeShippingThreshold:
            settings.checkoutConfig.freeShippingThreshold,
          prepaidDiscountPercent:
            settings.checkoutConfig.prepaidDiscountPercent,
          autoApplyCoupon: settings.checkoutConfig.autoApplyCoupon,
        },
        contact: settings.contact,
        promo_banner: settings.promoBanner,
      }),
    onSuccess: () => toast.success('Settings saved'),
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to save'),
  });
  const updateMethod = (
    id: string,
    update: Record<string, string | number | boolean>,
  ) =>
    setSettings((current) => ({
      ...current,
      checkoutConfig: {
        ...current.checkoutConfig,
        paymentMethods: {
          ...current.checkoutConfig.paymentMethods,
          [id]: {
            ...current.checkoutConfig.paymentMethods[id],
            ...update,
          },
        },
      },
    }));
  const addMethod = () => {
    const raw = window.prompt('Method ID', 'easypaisa');
    const id = raw?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!id) return;
    if (settings.checkoutConfig.paymentMethods[id])
      return toast.error('Already exists');
    updateMethod(id, {
      id,
      name: id,
      nameUr: id,
      description: 'Online payment',
      descriptionUr: 'آن لائن ادائیگی',
      deliveryFee: 0,
      requiresVerification: true,
    });
  };
  const removeMethod = (id: string) => {
    if (!window.confirm(`Delete "${id}" payment method?`)) return;
    setSettings((current) => {
      const methods = { ...current.checkoutConfig.paymentMethods };
      const details = { ...current.paymentDetails };
      delete methods[id];
      delete details[id];
      return {
        ...current,
        checkoutConfig: { ...current.checkoutConfig, paymentMethods: methods },
        paymentDetails: details,
      };
    });
  };

  if (query.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Store-wide configuration
          </p>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Settings
        </Button>
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <SettingsIcon className="h-4 w-4 text-primary" /> Payment Methods (
            {Object.keys(settings.checkoutConfig.paymentMethods).length})
          </h2>
          <Button variant="outline" size="sm" onClick={addMethod}>
            <Plus className="mr-1 h-4 w-4" /> Add Method
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure accepted payment methods. These apply to all products
          store-wide.
        </p>
        <div className="space-y-3">
          {Object.entries(settings.checkoutConfig.paymentMethods).map(
            ([id, method]) => (
              <div
                key={id}
                className="space-y-3 rounded-lg border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium uppercase">{id}</h4>
                  {id !== 'cod' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => removeMethod(id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Name (EN)</Label><Input className="h-8 text-sm" value={method.name} onChange={(e)=>updateMethod(id,{name:e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs">Name (UR)</Label><Input className="h-8 text-sm" value={method.nameUr} onChange={(e)=>updateMethod(id,{nameUr:e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs">Description (EN)</Label><Input className="h-8 text-sm" value={method.description} onChange={(e)=>updateMethod(id,{description:e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs">Description (UR)</Label><Input className="h-8 text-sm" value={method.descriptionUr} onChange={(e)=>updateMethod(id,{descriptionUr:e.target.value})} /></div>
                  <div className="space-y-1"><Label className="text-xs">Delivery Fee (PKR)</Label><Input type="number" className="h-8 text-sm" value={method.deliveryFee} onChange={(e)=>updateMethod(id,{deliveryFee:Number(e.target.value)})} /></div>
                  <div className="flex items-center gap-2 pt-4"><Switch checked={method.requiresVerification} disabled={id==='cod'} onCheckedChange={(value)=>updateMethod(id,{requiresVerification:value})} /><Label className="text-xs">Requires Verification</Label></div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Payment Account Details</h2>
        <p className="text-sm text-muted-foreground">
          Account numbers shown to customers for prepaid payment methods.
        </p>
        {Object.values(settings.checkoutConfig.paymentMethods)
          .filter((method) => method.id !== 'cod')
          .map((method) => {
            const detail = settings.paymentDetails[method.id] || {};
            const setDetail = (key: string, value: string) =>
              setSettings((current) => ({
                ...current,
                paymentDetails: {
                  ...current.paymentDetails,
                  [method.id]: {
                    ...(current.paymentDetails[method.id] || {}),
                    [key]: value,
                  },
                },
              }));
            return (
              <div key={method.id} className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <h3 className="text-sm font-medium">{method.name}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Account Name</Label><Input value={detail.accountName||''} onChange={(e)=>setDetail('accountName',e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Account Number</Label><Input value={detail.accountNumber||''} onChange={(e)=>setDetail('accountNumber',e.target.value)} /></div>
                  {method.id === 'bank' ? <><div className="space-y-1"><Label className="text-xs">Bank Name</Label><Input value={detail.bankName||''} onChange={(e)=>setDetail('bankName',e.target.value)} /></div><div className="space-y-1"><Label className="text-xs">IBAN</Label><Input value={detail.iban||''} onChange={(e)=>setDetail('iban',e.target.value)} /></div></> : null}
                </div>
              </div>
            );
          })}
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Checkout Configuration</h2>
        <p className="text-sm text-muted-foreground">
          One global pricing rule-set used by storefront checkout and order API.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {([
            ['codDeliveryFee','COD Delivery Fee (PKR)','Applied to COD orders below free-shipping threshold.'],
            ['freeShippingThreshold','COD Free Shipping Threshold (PKR)','COD delivery fee becomes zero when subtotal reaches this amount.'],
            ['prepaidDiscountPercent','Prepaid Discount (%)','Applied on subtotal for non-COD payment methods.'],
          ] as const).map(([key,label,help])=><div key={key} className="space-y-2"><Label>{label}</Label><Input type="number" value={settings.checkoutConfig[key]} onChange={(e)=>setSettings((current)=>({...current,checkoutConfig:{...current.checkoutConfig,[key]:Number(e.target.value)}}))} /><p className="text-xs text-muted-foreground">{help}</p></div>)}
          <div className="space-y-2"><Label>Auto-Apply Coupon Code</Label><Input value={settings.checkoutConfig.autoApplyCoupon} onChange={(e)=>setSettings((current)=>({...current,checkoutConfig:{...current.checkoutConfig,autoApplyCoupon:e.target.value.toUpperCase()}}))} placeholder="e.g. WELCOME10" /></div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>WhatsApp Number</Label><Input value={settings.contact.whatsappNumber} onChange={(e)=>setSettings((c)=>({...c,contact:{...c.contact,whatsappNumber:e.target.value}}))} /><p className="text-xs text-muted-foreground">International format, no + prefix</p></div>
          <div><Label>WhatsApp Display</Label><Input value={settings.contact.whatsappDisplay} onChange={(e)=>setSettings((c)=>({...c,contact:{...c.contact,whatsappDisplay:e.target.value}}))} /></div>
          <div><Label>Email</Label><Input type="email" value={settings.contact.email} onChange={(e)=>setSettings((c)=>({...c,contact:{...c.contact,email:e.target.value}}))} /></div>
          <div><Label>Business Name</Label><Input value={settings.contact.businessName} onChange={(e)=>setSettings((c)=>({...c,contact:{...c.contact,businessName:e.target.value}}))} /></div>
        </div>
        <label className="flex items-center gap-2 pt-2"><Switch checked={settings.contact.showFloatingButton} onCheckedChange={(value)=>setSettings((c)=>({...c,contact:{...c.contact,showFloatingButton:value}}))} /> Show floating WhatsApp button on storefront</label>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Promo Banner</h2>
        <div><Label>Banner Text (EN)</Label><Textarea value={settings.promoBanner.textEn} onChange={(e)=>setSettings((c)=>({...c,promoBanner:{...c.promoBanner,textEn:e.target.value}}))} placeholder="🔥 Limited Time: Free Delivery on Prepaid Orders!" /></div>
        <div><Label>Banner Text (UR)</Label><Textarea value={settings.promoBanner.textUr} onChange={(e)=>setSettings((c)=>({...c,promoBanner:{...c.promoBanner,textUr:e.target.value}}))} placeholder="🔥 محدود وقت: پری پیڈ آرڈرز پر مفت ڈیلیوری!" /></div>
      </section>

      <section className="divide-y rounded-lg border">
        {[['Language','Default: English. Users switch via header toggle (cookie-based).','Cookie-based',Globe],['Database','Cloudflare D1 via Drizzle ORM. Cached 5-min TTL.','D1',Database],['Auth','JWT session with HTTP-only cookies.','JWT',ShieldCheck]].map(([title,description,badge,Icon])=><div key={String(title)} className="flex items-start gap-4 p-4"><Icon className="mt-0.5 h-5 w-5 text-muted-foreground" /><div className="flex-1"><h3 className="font-medium">{String(title)}</h3><p className="mt-1 text-sm text-muted-foreground">{String(description)}</p></div><span className="rounded border px-2 py-1 text-xs">{String(badge)}</span></div>)}
      </section>
    </div>
  );
}
