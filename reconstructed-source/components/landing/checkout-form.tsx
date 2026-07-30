"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { readText, SectionHeading, SectionShell } from "./shared";
import type { BaseSectionProps, ProductPackage } from "./types";

export type CheckoutFormProps = BaseSectionProps & {
  selectedPackage: string;
  onPackageChange: (packageId: string) => void;
  siteSettings?: Record<string, unknown>;
  productId?: string;
  packages: Record<string, ProductPackage>;
};

export function CheckoutForm({
  lang,
  selectedPackage,
  onPackageChange,
  packages,
  config,
}: CheckoutFormProps) {
  return (
    <SectionShell id="checkout" tone="white">
      <SectionHeading
        title={readText(config, "headline", lang, lang === "ur" ? "اپنا آرڈر مکمل کریں" : "Complete your order")}
        subtitle={readText(config, "subtitle", lang)}
      />
      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <label className="text-sm font-semibold text-stone-800" htmlFor="landing-package">
          {lang === "ur" ? "پیکیج" : "Package"}
        </label>
        <select
          className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm"
          id="landing-package"
          onChange={(event) => onPackageChange(event.target.value)}
          value={selectedPackage}
        >
          {Object.entries(packages || {}).map(([id, item]) => (
            <option key={id} value={id}>
              {lang === "ur" && item.nameUr ? item.nameUr : item.name || id}
            </option>
          ))}
        </select>
        <Link
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 text-sm font-semibold text-white"
          href="/checkout"
        >
          <LockKeyhole className="h-4 w-4" />
          {lang === "ur" ? "محفوظ چیک آؤٹ" : "Continue to secure checkout"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionShell>
  );
}
