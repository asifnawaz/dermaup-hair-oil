'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminDelete, adminFetch } from '@/lib/admin-api';

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  active: boolean;
};
type CouponResponse = {
  coupons: Coupon[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const coupons = useQuery({
    queryKey: ['coupons', { page, search }],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      return adminFetch<CouponResponse>(`/api/admin/coupons?${params}`);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDelete(`/api/admin/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(input);
    setPage(1);
  };
  const data = coupons.data?.coupons || [];
  const pagination = coupons.data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="flex items-center gap-2 text-2xl font-bold"><TicketPercent className="h-6 w-6" /> Coupons</h1><p className="text-sm text-muted-foreground">Manage discount codes and promotions</p></div>
        <div className="flex items-center gap-2">
          <Button asChild><Link href="/backoffice/coupons/new"><Plus className="mr-2 h-4 w-4" /> New Coupon</Link></Button>
          <Button variant="outline" size="icon" onClick={()=>coupons.refetch()} disabled={coupons.isFetching}><RefreshCw className={`h-4 w-4 ${coupons.isFetching?'animate-spin':''}`} /></Button>
        </div>
      </div>
      <div className="rounded-xl border bg-background p-4">
        <form onSubmit={submit} className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Search by coupon code..." className="pl-10" /></div><Button type="submit">Search</Button></form>
      </div>
      {coupons.isLoading ? <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : coupons.error ? <div className="rounded-xl border bg-background py-12 text-center"><p className="mb-4 text-destructive">{coupons.error.message}</p><Button onClick={()=>coupons.refetch()}>Try Again</Button></div> : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="w-full text-sm"><thead className="border-b bg-muted/30 text-left"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Min Order</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th /></tr></thead>
          <tbody className="divide-y">{data.map((coupon)=><tr key={coupon.id}><td className="px-4 py-3 font-mono font-bold">{coupon.code}</td><td className="px-4 py-3">{coupon.type==='percentage'?`${coupon.value}%`:`PKR ${coupon.value}`}</td><td className="px-4 py-3">{coupon.minOrder?`PKR ${coupon.minOrder}`:'—'}</td><td className="px-4 py-3">{coupon.usedCount||0} / {coupon.maxUses??'∞'}</td><td className="px-4 py-3">{coupon.expiresAt?new Date(coupon.expiresAt).toLocaleDateString():'Never'}</td><td className="px-4 py-3">{coupon.active?'Active':'Inactive'}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="sm"><Link href={`/backoffice/coupons/${coupon.id}`}><Pencil className="h-4 w-4" /></Link></Button><Button variant="ghost" size="sm" onClick={()=>{if(window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`))remove.mutate(coupon.id);}}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></td></tr>)}</tbody></table>
          {pagination.totalPages>1?<div className="flex items-center justify-between border-t p-3"><span className="text-xs text-muted-foreground">{pagination.total} coupons</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</Button><Button variant="outline" size="sm" disabled={page>=pagination.totalPages} onClick={()=>setPage(page+1)}>Next</Button></div></div>:null}
        </div>
      )}
    </div>
  );
}
