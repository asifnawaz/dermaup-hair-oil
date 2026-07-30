"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { adminFetch } from "@/lib/admin-api";

const labelMap: Record<string, string> = {
  backoffice: "Admin",
  dashboard: "Dashboard",
  orders: "Orders",
  analytics: "Analytics",
  subscribers: "Subscribers",
  coupons: "Coupons",
  customers: "Customers",
  content: "Content",
  pages: "Pages",
  blocks: "Blocks",
  products: "Products",
  media: "Media",
  settings: "Settings",
  users: "Users",
  new: "New",
};

function EntityLabel({ segment }: { segment: string }) {
  const entityType = segment.startsWith("page_")
    ? "pages"
    : segment.startsWith("cb_")
      ? "blocks"
      : segment.startsWith("prod_")
        ? "products"
        : null;
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["breadcrumb", entityType, segment],
    queryFn: () =>
      adminFetch(`/api/admin/content/${entityType}/${segment}`),
    enabled: Boolean(entityType),
    staleTime: 60_000,
  });

  if (!entityType) return <>{segment}</>;
  const label = data?.title || data?.name || data?.slug;
  if (label) return <>{label.length > 30 ? `${label.slice(0, 30)}…` : label}</>;
  return <>{segment.slice(0, 12)}…</>;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/backoffice/dashboard") return null;

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "backoffice");
  if (segments.length <= 1) return null;

  const breadcrumbs = segments.map((segment, index) => ({
    href: `/backoffice/${segments.slice(0, index + 1).join("/")}`,
    label: labelMap[segment] || decodeURIComponent(segment),
    isLast: index === segments.length - 1,
    isEntity: /^(page|cb|prod|ps)_/.test(segment),
    segment,
  }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/backoffice/dashboard"
            className="transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <React.Fragment key={breadcrumb.href}>
            <li>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              {breadcrumb.isLast ? (
                <span className="font-medium text-foreground">
                  {breadcrumb.isEntity ? (
                    <EntityLabel segment={breadcrumb.segment} />
                  ) : (
                    breadcrumb.label
                  )}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="transition-colors hover:text-foreground"
                >
                  {breadcrumb.isEntity ? (
                    <EntityLabel segment={breadcrumb.segment} />
                  ) : (
                    breadcrumb.label
                  )}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
