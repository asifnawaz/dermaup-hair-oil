/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered exactly from production client chunk 7909 (module 27909) and
 * cross-checked against the surviving source index.
 */

import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Language } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface PolicyLayoutProps {
  lang: Language;
  title: string;
  titleUr?: string;
  lastUpdated: string;
  eyebrow?: string;
  summary?: string;
  children: ReactNode;
}

export function PolicyLayout({
  lang,
  title,
  titleUr,
  lastUpdated,
  eyebrow,
  summary,
  children,
}: PolicyLayoutProps) {
  const isRtl = lang === "ur";
  const displayTitle = isRtl && titleUr ? titleUr : title;

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#171b1d]">
      <section className="relative overflow-hidden border-b border-[#dfd9cc] bg-[#202428] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(199,229,219,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />
        <div className="container relative mx-auto px-4 pb-12 pt-8 md:pb-16 md:pt-12">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-2 text-xs font-bold text-white/86 backdrop-blur transition hover:bg-white/14",
              isRtl && "flex-row-reverse font-urdu",
            )}
          >
            <ArrowLeft
              className={cn("h-4 w-4", isRtl && "rotate-180")}
            />
            <span>{lang === "ur" ? "واپس جائیں" : "Back to Home"}</span>
          </Link>

          <div
            className={cn(
              "mx-auto mt-10 max-w-3xl text-center",
              isRtl && "font-urdu",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c7e5db]",
                isRtl && "flex-row-reverse normal-case tracking-normal",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c7e5db]" />
              {eyebrow || (lang === "ur" ? "اسٹور پالیسی" : "Store Policy")}
            </span>
            <h1
              className={cn(
                "mt-4 text-4xl font-semibold leading-[0.98] tracking-normal md:text-6xl",
                isRtl && "leading-[1.25]",
              )}
            >
              {displayTitle}
            </h1>
            {summary && (
              <p
                className={cn(
                  "mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-white/72 md:text-base",
                  isRtl && "font-urdu",
                )}
              >
                {summary}
              </p>
            )}
            <div
              className={cn(
                "mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#171b1d] shadow-sm",
                isRtl && "flex-row-reverse",
              )}
            >
              <ShieldCheck className="h-4 w-4 text-[#6f8f82]" />
              <span>
                {lang === "ur"
                  ? `آخری تازہ کاری: ${lastUpdated}`
                  : `Last updated: ${lastUpdated}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              "rounded-[1.6rem] border border-[#e1dbcf] bg-white p-5 shadow-[0_24px_80px_rgba(32,36,40,0.08)] md:p-8",
              isRtl && "text-right font-urdu",
            )}
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
