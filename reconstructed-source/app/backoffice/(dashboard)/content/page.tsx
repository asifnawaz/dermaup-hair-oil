'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Blocks,
  FileText,
  Package,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { adminFetch } from '@/lib/admin-api';

import type {
  ContentBlockRecord,
  PageRecord,
  ProductRecord,
} from './_types';

const CARDS = [
  {
    title: 'Pages',
    description: 'Landing pages with customizable sections',
    href: '/backoffice/content/pages',
    newHref: '/backoffice/content/pages/new',
    color: 'text-blue-600 bg-blue-50',
    icon: FileText,
    key: 'pages',
  },
  {
    title: 'Products',
    description: 'Product catalog with packages and pricing',
    href: '/backoffice/content/products',
    newHref: '/backoffice/content/products/new',
    color: 'text-emerald-600 bg-emerald-50',
    icon: Package,
    key: 'products',
  },
  {
    title: 'Content Blocks',
    description: 'Testimonials, FAQs, ingredients, and more',
    href: '/backoffice/content/blocks',
    newHref: '/backoffice/content/blocks/new',
    color: 'text-purple-600 bg-purple-50',
    icon: Blocks,
    key: 'blocks',
  },
] as const;

export default function AdminContentPage() {
  const pages = useQuery({
    queryKey: ['pages'],
    queryFn: () => adminFetch<PageRecord[]>('/api/admin/content/pages'),
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: () => adminFetch<ProductRecord[]>('/api/admin/content/products'),
  });
  const blocks = useQuery({
    queryKey: ['blocks'],
    queryFn: () =>
      adminFetch<ContentBlockRecord[]>('/api/admin/content/blocks'),
  });

  const counts = {
    pages: pages.data?.length || 0,
    products: products.data?.length || 0,
    blocks: blocks.data?.length || 0,
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your website content — pages, products, and content blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="space-y-4 rounded-lg border p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold">{counts[card.key]}</span>
              </div>
              <div>
                <h3 className="font-semibold">{card.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                  <Link href={card.href}>
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1 text-xs">
                  <Link href={card.newHref}>
                    <Plus className="mr-1 h-3 w-3" /> New
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/20 p-5">
        <h2 className="mb-3 font-semibold">Getting Started</h2>
        <div className="space-y-1.5">
          {[
            [
              'Create a Product',
              'Set up your product with packages, pricing, and descriptions.',
            ],
            [
              'Add Content Blocks',
              'Create testimonials, FAQs, and ingredients for your product.',
            ],
            [
              'Build a Landing Page',
              'Create a page and add sections to build your landing page layout.',
            ],
          ].map(([title, description], index) => (
            <div key={title}>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{title}</span>
              </div>
              <p className="pl-8 text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {(pages.data?.length || 0) > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Pages</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/backoffice/content/pages">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y rounded-lg border">
            {pages.data?.slice(0, 5).map((page) => (
              <Link
                key={page.id}
                href={`/backoffice/content/pages/${page.id}`}
                className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted/30"
              >
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{page.title}</span>
                  <code className="ml-2 text-xs text-muted-foreground">
                    {page.slug}
                  </code>
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    page.active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {page.active ? 'Active' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
