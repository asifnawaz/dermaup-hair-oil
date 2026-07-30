'use client';

import type { FormEvent } from 'react';

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

export type CouponValues = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  appliesTo: string | null;
  active: boolean;
  startsAt: string;
  expiresAt: string;
};

export const EMPTY_COUPON: CouponValues = {
  code: '',
  type: 'percentage',
  value: 1,
  minOrder: 0,
  maxUses: null,
  appliesTo: null,
  active: true,
  startsAt: '',
  expiresAt: '',
};

export function CouponForm({
  value,
  onChange,
  onSubmit,
  pending,
  submitLabel,
}: {
  value: CouponValues;
  onChange: (value: CouponValues) => void;
  onSubmit: (event: FormEvent) => void;
  pending: boolean;
  submitLabel: string;
}) {
  const set = <K extends keyof CouponValues>(key: K, next: CouponValues[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-background p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <Input
              value={value.code}
              onChange={(event) => set('code', event.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className="font-mono uppercase"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <Select
              value={value.type}
              onValueChange={(next) =>
                set('type', next as CouponValues['type'])
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (PKR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{value.type === 'percentage' ? 'Discount (%)' : 'Discount (PKR)'}</Label>
            <Input type="number" min={1} value={value.value} onChange={(e)=>set('value',Number(e.target.value))} required />
          </div>
          <div className="space-y-2">
            <Label>Minimum Order (PKR)</Label>
            <Input type="number" min={0} value={value.minOrder} onChange={(e)=>set('minOrder',Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">0 = no minimum</p>
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-xl border bg-background p-6">
        <h2 className="font-semibold">Usage Limits</h2>
        <div className="space-y-2">
          <Label>Max Uses</Label>
          <Input type="number" min={0} value={value.maxUses ?? ''} placeholder="Unlimited" onChange={(e)=>set('maxUses',e.target.value===''?null:Number(e.target.value))} />
          <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
        </div>
      </section>
      <section className="space-y-4 rounded-xl border bg-background p-6">
        <h2 className="font-semibold">Schedule</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Start Date</Label><Input type="datetime-local" value={value.startsAt} onChange={(e)=>set('startsAt',e.target.value)} /><p className="text-xs text-muted-foreground">Leave empty for immediate</p></div>
          <div className="space-y-2"><Label>Expiry Date</Label><Input type="datetime-local" value={value.expiresAt} onChange={(e)=>set('expiresAt',e.target.value)} /><p className="text-xs text-muted-foreground">Leave empty for no expiry</p></div>
        </div>
      </section>
      <section className="rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Switch checked={value.active} onCheckedChange={(next)=>set('active',next)} /><Label>Active</Label></div>
          <Button type="submit" disabled={pending}>{submitLabel}</Button>
        </div>
      </section>
    </form>
  );
}
