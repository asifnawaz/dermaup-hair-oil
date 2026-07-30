'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { adminDelete, adminFetch, adminPut } from '@/lib/admin-api';

import { CouponForm, EMPTY_COUPON, type CouponValues } from '../_coupon-form';

type Coupon = CouponValues & { id: string; usedCount: number; startsAt?: string | null; expiresAt?: string | null };
const localDate = (value?: string | null) => value ? new Date(value).toISOString().slice(0,16) : '';

export default function EditCouponPage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const [value,setValue]=useState<CouponValues>(EMPTY_COUPON);
  const coupon=useQuery({queryKey:['coupon',id],queryFn:()=>adminFetch<Coupon>(`/api/admin/coupons/${id}`)});
  useEffect(()=>{if(coupon.data)setValue({...coupon.data,startsAt:localDate(coupon.data.startsAt),expiresAt:localDate(coupon.data.expiresAt)});},[coupon.data]);
  const update=useMutation({mutationFn:()=>adminPut(`/api/admin/coupons/${id}`,value),onSuccess:()=>toast.success('Coupon updated'),onError:(error:Error)=>toast.error(error.message)});
  const remove=useMutation({mutationFn:()=>adminDelete(`/api/admin/coupons/${id}`),onSuccess:()=>{toast.success('Coupon deleted');router.push('/backoffice/coupons');},onError:(error:Error)=>toast.error(error.message)});
  const submit=(event:FormEvent)=>{event.preventDefault();update.mutate();};
  if(coupon.isLoading)return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if(!coupon.data)return <div className="py-12 text-center"><p className="mb-4 text-destructive">Coupon not found</p><Button onClick={()=>router.push('/backoffice/coupons')}>Back to Coupons</Button></div>;
  return <div className="max-w-2xl space-y-6">
    <div className="flex items-center justify-between"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={()=>router.back()}><ArrowLeft className="h-5 w-5" /></Button><div><h1 className="font-mono text-2xl font-bold">{coupon.data.code}</h1><p className="text-sm text-muted-foreground">Used {coupon.data.usedCount||0} times</p></div></div><Button variant="outline" className="text-destructive" onClick={()=>{if(window.confirm(`Delete coupon "${coupon.data?.code}"?`))remove.mutate();}}>Delete</Button></div>
    <CouponForm value={value} onChange={setValue} onSubmit={submit} pending={update.isPending} submitLabel="Save Changes" />
  </div>;
}
