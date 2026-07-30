'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, TicketPercent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { adminPost } from '@/lib/admin-api';

import { CouponForm, EMPTY_COUPON, type CouponValues } from '../_coupon-form';

export default function NewCouponPage() {
  const router = useRouter();
  const [value, setValue] = useState<CouponValues>(EMPTY_COUPON);
  const create = useMutation({
    mutationFn: () => adminPost('/api/admin/coupons', value),
    onSuccess: () => {
      toast.success('Coupon created');
      router.push('/backoffice/coupons');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.code.trim()) return toast.error('Code is required');
    create.mutate();
  };
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold">New Coupon</h1><p className="text-sm text-muted-foreground">Create a new discount code</p></div>
        <TicketPercent className="ml-auto h-5 w-5 text-muted-foreground" />
      </div>
      <CouponForm value={value} onChange={setValue} onSubmit={submit} pending={create.isPending} submitLabel="Create Coupon" />
    </div>
  );
}
