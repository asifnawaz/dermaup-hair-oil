"use client";

import {
  ArrowRight,
  Check,
  MessageCircle,
  Microscope,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { getTrustProofItems } from "@/lib/trust-proof";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TrustProofStrip } from "@/components/shared/trust-proof-strip";
import type {
  HomepageProductCardViewModel,
  HomepageTestimonialCardViewModel,
  HomepageViewModel,
} from "@/lib/homepage-view-model";

type SectionConfig = Record<string, unknown> | undefined;

const VISUAL_FALLBACKS = {
  research: "/homepage/formula-research-visual.webp",
  customerProof: "/homepage/customer-routine-proof.webp",
} as const;

export function SectionKicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#6f7b76]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#9bcfbe]" />
      {children}
    </span>
  );
}

export function ArrowIcon({ isRtl }: { isRtl: boolean }) {
  return (
    <ArrowRight
      className={cn(
        "h-4 w-4 transition-transform group-hover:translate-x-0.5",
        isRtl && "rotate-180 group-hover:-translate-x-0.5",
      )}
    />
  );
}

function validImageSource(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !["null", "undefined"].includes(value.trim().toLowerCase());
}

export function VisualImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  fit = "cover",
  fallbackTitle,
  fallbackMeta,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  fallbackTitle?: string;
  fallbackMeta?: string | null;
}) {
  if (!validImageSource(src)) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col justify-between bg-[linear-gradient(135deg,#f5f7f5,#dfe8e3)] p-4 text-[#20272a]",
          className,
        )}
      >
        <div className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#7c8b86]">
          UpDerma
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight tracking-normal">
            {fallbackTitle || alt}
          </div>
          {fallbackMeta && (
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f7d78]">
              {fallbackMeta}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
    />
  );
}

function configString(
  config: SectionConfig,
  key: string,
  fallback = "",
): string {
  const value = config?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function translatedConfigValue(
  config: SectionConfig,
  key: string,
  isRtl: boolean,
) {
  const translationKey = configString(
    config,
    isRtl ? `${key}KeyUr` : `${key}Key`,
    configString(config, `${key}Key`),
  );
  return translationKey ? t(translationKey, isRtl ? "ur" : "en") : undefined;
}

function localizedConfigString(
  config: SectionConfig,
  key: string,
  isRtl: boolean,
  fallback = "",
): string {
  const direct = configString(config, isRtl ? `${key}Ur` : key);
  if (direct) return direct;
  const translated = translatedConfigValue(config, key, isRtl);
  if (typeof translated === "string" && translated.trim()) return translated;
  return isRtl ? configString(config, key, fallback) : fallback;
}

function configStringArray(
  config: SectionConfig,
  key: string,
  fallback: string[] = [],
): string[] {
  const value = config?.[key];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim()),
    );
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function localizedConfigArray(
  config: SectionConfig,
  key: string,
  isRtl: boolean,
  fallback: string[] = [],
): string[] {
  const direct = configStringArray(config, isRtl ? `${key}Ur` : key);
  if (direct.length) return direct;
  const translated = translatedConfigValue(config, key, isRtl);
  if (Array.isArray(translated)) {
    return translated.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim()),
    );
  }
  return isRtl ? configStringArray(config, key, fallback) : fallback;
}

function configCsv(config: SectionConfig, key: string): string[] {
  const value = config?.[key];
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim()),
    );
  }
  return typeof value === "string" && value.trim()
    ? value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function configNumber(
  config: SectionConfig,
  key: string,
  fallback: number,
): number {
  const value = config?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function HomepageHeroSection({
  hero,
  isRtl,
  config,
}: {
  hero: HomepageViewModel["hero"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-[#101416] text-white md:min-h-[680px]">
      <div className="absolute inset-0">
        <VisualImage
          src={configString(config, "heroImage", hero.visualImageUrl)}
          alt="UpDerma skincare routine hero image"
          sizes="100vw"
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,11,0.14)_0%,rgba(7,10,11,0.38)_42%,rgba(7,10,11,0.64)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.06)_62%,rgba(0,0,0,0)_100%)]" />
      </div>
      <div className="container relative z-10 mx-auto flex min-h-[520px] items-center px-4 pb-9 pt-24 md:min-h-[680px] md:pb-16 md:pt-28">
        <div
          className={cn(
            "mx-auto max-w-[720px] translate-y-4 text-center md:translate-y-10",
            isRtl && "font-urdu",
          )}
        >
          <SectionKicker
            className={cn(
              "justify-center text-white/80",
              isRtl && "flex-row-reverse normal-case tracking-normal",
            )}
          >
            {localizedConfigString(config, "eyebrow", isRtl, hero.eyebrow)}
          </SectionKicker>
          <h1
            className={cn(
              "mt-4 text-4xl font-semibold leading-[0.98] tracking-normal text-white drop-shadow-sm md:text-6xl",
              isRtl && "leading-[1.35]",
            )}
          >
            {localizedConfigString(config, "headline", isRtl, hero.headline)}
          </h1>
          <p
            className={cn(
              "mx-auto mt-4 max-w-[32rem] text-[13px] font-semibold leading-6 text-white/86 md:text-base",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "subtitle", isRtl, hero.subtitle)}
          </p>
          <div
            className={cn(
              "mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center",
              isRtl && "font-urdu sm:flex-row-reverse",
            )}
          >
            <Link
              href={configString(config, "ctaHref", hero.primaryHref)}
              className="group inline-flex min-h-12 w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#15191b] shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:bg-[#f2f4f3] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#101416] sm:w-auto sm:min-w-[220px]"
            >
              {localizedConfigString(config, "ctaText", isRtl, hero.primaryCta)}
              <ArrowIcon isRtl={isRtl} />
            </Link>
            <Link
              href={configString(config, "secondaryHref", hero.secondaryHref)}
              className="inline-flex min-h-12 w-full cursor-pointer touch-manipulation items-center justify-center rounded-full border border-white/42 px-7 py-3 text-xs font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#101416] sm:w-auto"
            >
              {localizedConfigString(
                config,
                "secondaryCta",
                isRtl,
                hero.secondaryCta,
              )}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProofBand({
  proof,
  isRtl,
  config,
}: {
  proof: HomepageViewModel["proof"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  const items = getTrustProofItems(isRtl ? "ur" : "en", config);
  const footnote = localizedConfigString(
    config,
    "footnote",
    isRtl,
    proof.footnote,
  );
  return (
    <section className="bg-[#f7faf8] py-9 text-center md:py-12">
      <div className="container mx-auto px-4">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d8782]",
            isRtl && "font-urdu normal-case tracking-normal",
          )}
        >
          {localizedConfigString(config, "eyebrow", isRtl, proof.eyebrow)}
        </p>
        <p
          className={cn(
            "mx-auto mt-4 max-w-[38rem] text-[1.08rem] font-semibold leading-snug text-[#202428] md:text-3xl",
            isRtl && "font-urdu",
          )}
        >
          “{localizedConfigString(config, "quote", isRtl, proof.quote)}”
        </p>
        <TrustProofStrip
          items={items}
          isRtl={isRtl}
          variant="inline"
          className="mx-auto mt-5 max-w-4xl rounded-2xl border border-[#dfe8e3] bg-white/78 px-3 py-3 shadow-sm sm:px-5"
        />
        {footnote && (
          <p
            className={cn(
              "mx-auto mt-3 max-w-xl text-[10px] font-medium leading-5 text-[#6d7773]",
              isRtl && "font-urdu",
            )}
          >
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}

export function HomepageProductCard({
  product,
  isRtl,
}: {
  product: HomepageProductCardViewModel;
  isRtl: boolean;
}) {
  return (
    <Link
      href={product.href}
      className="group block h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15191b] focus-visible:ring-offset-4"
    >
      <article className="grid h-full grid-cols-[0.42fr_0.58fr] overflow-hidden rounded-lg border border-[#e1e8e4] bg-white transition duration-200 group-hover:shadow-[0_16px_40px_rgba(20,28,25,0.08)] sm:flex sm:flex-col">
        <div className="relative min-h-[196px] overflow-hidden bg-[#f2f4f3] sm:aspect-[1.03] sm:min-h-0 sm:rounded-lg">
          <VisualImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, 25vw"
            fit="contain"
            fallbackTitle={product.name}
            fallbackMeta={product.volumeLabel || product.badge}
            className="p-2 transition duration-700 group-hover:scale-[1.035]"
          />
          <div
            className={cn(
              "absolute left-2 top-2 flex flex-wrap gap-1.5",
              isRtl && "left-auto right-2 flex-row-reverse",
            )}
          >
            {product.badge && (
              <span className="rounded-full bg-[#ff5a2f] px-2 py-1 text-[9px] font-black text-white">
                {product.badge}
              </span>
            )}
            {product.volumeLabel && (
              <span className="rounded-full bg-white/92 px-2 py-1 text-[9px] font-bold text-[#596661] shadow-sm">
                {product.volumeLabel}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col p-3",
            isRtl && "text-right",
          )}
        >
          <div
            className={cn(
              "mb-2 flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2",
              isRtl && "items-end sm:flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "line-clamp-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#697570]",
                isRtl && "font-urdu normal-case tracking-normal",
              )}
            >
              {product.categoryLabel}
            </span>
            {product.bestForLabel && (
              <span
                className={cn(
                  "line-clamp-1 rounded-full bg-[#eef7f3] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#2f715f] sm:max-w-[120px]",
                  isRtl && "normal-case tracking-normal",
                )}
              >
                {product.bestForLabel}
              </span>
            )}
          </div>
          <h3
            className={cn(
              "mt-1 line-clamp-2 text-[13px] font-black leading-snug text-[#111417]",
              isRtl && "font-urdu",
            )}
          >
            {product.name}
          </h3>
          <p
            className={cn(
              "mt-0.5 line-clamp-1 text-[10px] font-semibold text-[#6b7773]",
              isRtl && "font-urdu",
            )}
          >
            {product.routineLabel}
          </p>
          {product.decisionLabel && (
            <p
              className={cn(
                "mt-2 line-clamp-3 text-xs font-medium leading-5 text-[#43504b]",
                isRtl && "font-urdu",
              )}
            >
              {product.decisionLabel}
            </p>
          )}
          <div
            className={cn(
              "mt-auto flex items-center justify-between gap-2 pt-2",
              isRtl && "flex-row-reverse",
            )}
          >
            {product.priceLabel && (
              <div
                className={cn(
                  "min-w-0 whitespace-nowrap text-[12px] font-black text-[#111417]",
                  isRtl && "text-right",
                )}
              >
                <div>{product.priceLabel}</div>
                {product.compareAtPriceLabel && (
                  <div className="mt-0.5 text-[10px] font-semibold text-[#8b9691] line-through">
                    {product.compareAtPriceLabel}
                  </div>
                )}
              </div>
            )}
            <span
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#15191b] px-2.5 text-[9px] font-black text-white transition group-hover:bg-black sm:px-3 sm:text-[10px]",
                isRtl && "flex-row-reverse",
              )}
            >
              {product.ctaLabel}
              <ArrowRight className={cn("h-3 w-3", isRtl && "rotate-180")} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function Bestsellers({
  bestsellers,
  isRtl,
  config,
}: {
  bestsellers: HomepageViewModel["bestsellers"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  if (!bestsellers.products.length) return null;
  const configuredSlugs = [
    ...configCsv(config, "productSlugs"),
    ...configCsv(config, "featuredProductSlugs"),
  ];
  const productMap = new Map(
    bestsellers.products.map((product) => [product.slug, product]),
  );
  const limit = Math.max(1, configNumber(config, "limit", 4));
  const products = (
    configuredSlugs.length
      ? configuredSlugs
          .map((slug) => productMap.get(slug))
          .filter((product): product is HomepageProductCardViewModel =>
            Boolean(product),
          )
      : bestsellers.products
  ).slice(0, limit);
  if (!products.length) return null;

  return (
    <section id="bestsellers" className="bg-white py-11 md:py-18">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <SectionKicker
            className={cn(
              "justify-center",
              isRtl && "flex-row-reverse font-urdu normal-case tracking-normal",
            )}
          >
            {localizedConfigString(
              config,
              "eyebrow",
              isRtl,
              bestsellers.eyebrow,
            )}
          </SectionKicker>
          <h2
            className={cn(
              "text-[2rem] font-semibold leading-[1.05] tracking-normal text-[#171b1d] md:text-5xl",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(
              config,
              "headline",
              isRtl,
              bestsellers.title,
            )}
          </h2>
          <p
            className={cn(
              "mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-[#53615c]",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "subtitle", isRtl, bestsellers.body)}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <HomepageProductCard
              key={product.slug}
              product={product}
              isRtl={isRtl}
            />
          ))}
        </div>
        <div className="mt-7 text-center">
          <Link
            href={configString(config, "ctaHref", bestsellers.href)}
            className={cn(
              "group inline-flex min-h-12 cursor-pointer touch-manipulation items-center gap-2 rounded-full bg-[#15191b] px-6 py-3 text-sm font-bold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#15191b] focus:ring-offset-2",
              isRtl && "flex-row-reverse font-urdu",
            )}
          >
            {localizedConfigString(config, "ctaText", isRtl, bestsellers.cta)}
            <ArrowIcon isRtl={isRtl} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TestimonialCard({
  card,
  isRtl,
}: {
  card: HomepageTestimonialCardViewModel;
  isRtl: boolean;
}) {
  return (
    <article
      className={cn(
        "h-full rounded-lg border border-[#e2e7e4] bg-white p-4 shadow-sm",
        isRtl && "text-right",
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center gap-1 text-[#f5b742]",
          isRtl && "flex-row-reverse",
        )}
      >
        {Array.from({ length: Math.max(1, Math.min(card.rating, 5)) }).map(
          (_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-current" />
          ),
        )}
      </div>
      <p
        className={cn(
          "line-clamp-5 text-[13px] font-medium leading-6 text-[#34413c]",
          isRtl && "font-urdu",
        )}
      >
        “{card.text}”
      </p>
      <div
        className={cn(
          "mt-4 flex items-end justify-between gap-3",
          isRtl && "flex-row-reverse",
        )}
      >
        <div>
          <div
            className={cn(
              "text-sm font-bold text-[#15191b]",
              isRtl && "font-urdu",
            )}
          >
            {card.name}
          </div>
          {card.city && (
            <div
              className={cn(
                "text-xs text-[#87918d]",
                isRtl && "font-urdu",
              )}
            >
              {card.city}
            </div>
          )}
        </div>
        <span className="rounded-full bg-[#e7f5ef] px-2.5 py-1 text-[10px] font-bold text-[#3a8f76]">
          {card.verifiedLabel}
        </span>
      </div>
    </article>
  );
}

export function Results({
  results,
  isRtl,
  config,
}: {
  results: HomepageViewModel["results"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  if (!results.testimonials.length) return null;
  return (
    <section id="results" className="bg-white py-11 md:py-18">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl">
          <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-lg bg-[#eef3f0] md:aspect-[16/10]">
            <VisualImage
              src={configString(
                config,
                "visualImage",
                VISUAL_FALLBACKS.customerProof,
              )}
              alt="Customer feedback and healthy skin visual"
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/92 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur">
              <div
                className={cn(
                  "mb-2 flex items-center gap-1 text-[#f5b742]",
                  isRtl && "flex-row-reverse",
                )}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p
                className={cn(
                  "text-[12px] font-black uppercase tracking-[0.16em] text-[#6f7b76]",
                  isRtl && "font-urdu normal-case tracking-normal",
                )}
              >
                {localizedConfigString(
                  config,
                  "subtitle",
                  isRtl,
                  results.subtitle,
                )}
              </p>
              <h2
                className={cn(
                  "mt-1 text-[1.65rem] font-semibold leading-[1.05] tracking-normal text-[#171b1d]",
                  isRtl && "font-urdu",
                )}
              >
                {localizedConfigString(
                  config,
                  "headline",
                  isRtl,
                  results.title,
                )}
              </h2>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {results.testimonials.slice(0, 4).map((card, index) => (
              <TestimonialCard
                key={`${card.name}-${card.city}-${index}`}
                card={card}
                isRtl={isRtl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Research({
  isRtl,
  config,
}: {
  isRtl: boolean;
  config?: SectionConfig;
}) {
  const cards = localizedConfigArray(config, "cards", isRtl);
  const icons: ComponentType<{ className?: string }>[] = [
    Microscope,
    ShieldCheck,
    MoonStar,
    Sparkles,
  ];
  return (
    <section className="bg-[#f2f4f3] py-11 md:py-18">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl">
          <div className="relative mb-6 aspect-[0.82] overflow-hidden rounded-lg bg-white md:aspect-[16/10]">
            <VisualImage
              src={configString(
                config,
                "visualImage",
                VISUAL_FALLBACKS.research,
              )}
              alt={configString(
                config,
                "visualAlt",
                "Research backed formulation ingredients visual",
              )}
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#171b1d] shadow-sm backdrop-blur">
              {localizedConfigString(config, "eyebrow", isRtl)}
            </div>
          </div>
          <div className={cn(isRtl && "text-right")}>
            <SectionKicker
              className={cn(
                isRtl &&
                  "flex-row-reverse font-urdu normal-case tracking-normal",
              )}
            >
              {localizedConfigString(config, "eyebrow", isRtl)}
            </SectionKicker>
            <h2
              className={cn(
                "mt-3 text-[2rem] font-semibold leading-[1.05] tracking-normal text-[#171b1d] md:text-5xl",
                isRtl && "font-urdu",
              )}
            >
              {localizedConfigString(config, "headline", isRtl)}
            </h2>
            <p
              className={cn(
                "mt-4 text-sm font-medium leading-7 text-[#34413c]",
                isRtl && "font-urdu",
              )}
            >
              {localizedConfigString(config, "subtitle", isRtl)}
            </p>
            {cards.length > 0 && (
              <div className="mt-5 grid gap-2">
                {cards.map((card, index) => {
                  const Icon = icons[index % icons.length];
                  return (
                    <div
                      key={card}
                      className={cn(
                        "flex items-center gap-3 rounded-lg bg-white p-4 text-sm font-bold text-[#171b1d] shadow-sm",
                        isRtl && "flex-row-reverse font-urdu",
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7ddcf] bg-[#f7f4eb] text-[#56796f]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {card}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MobileStickyCta({
  hero,
  consult,
  whatsappUrl,
  isRtl,
  onConsultClick,
}: {
  hero: HomepageViewModel["hero"];
  consult: HomepageViewModel["consult"];
  whatsappUrl: string;
  isRtl: boolean;
  onConsultClick: () => void;
}) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_minmax(104px,auto)] gap-2 rounded-full border border-[#dfe8e3] bg-white/96 p-1.5 shadow-[0_18px_50px_rgba(17,24,20,0.22)] backdrop-blur",
          isRtl && "direction-rtl",
        )}
      >
        <Link
          href={hero.primaryHref}
          className={cn(
            "group inline-flex min-h-12 min-w-0 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-[#15191b] px-4 text-sm font-black text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#15191b] focus:ring-offset-2",
            isRtl && "flex-row-reverse font-urdu",
          )}
        >
          <span className="min-w-0 truncate">{hero.stickyCta}</span>
          <ArrowIcon isRtl={isRtl} />
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          onClick={onConsultClick}
          className={cn(
            "inline-flex min-h-12 min-w-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-full border border-[#d7e2dd] px-3 text-[11px] font-black text-[#17201c] transition hover:bg-[#f2f7f4] focus:outline-none focus:ring-2 focus:ring-[#15191b] focus:ring-offset-2",
            isRtl && "flex-row-reverse font-urdu-tight",
          )}
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-[#2f8f67]" />
          <span className="min-w-0 truncate">{consult.primary}</span>
        </a>
      </div>
    </div>
  );
}

export function Guidance({
  guidance,
  isRtl,
  config,
}: {
  guidance: HomepageViewModel["guidance"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  return (
    <section className="bg-white py-11 md:py-18">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl">
          <div className="relative mb-6 aspect-[1.04] overflow-hidden rounded-lg bg-[#eef3f0] md:aspect-[16/9]">
            <VisualImage
              src={configString(
                config,
                "visualImage",
                guidance.visualImageUrl,
              )}
              alt="UpDerma routine flatlay"
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          <div className={cn(isRtl && "text-right")}>
            <h2
              className={cn(
                "text-[2rem] font-semibold leading-[1.05] tracking-normal text-[#171b1d] md:text-5xl",
                isRtl && "font-urdu",
              )}
            >
              {localizedConfigString(
                config,
                "headline",
                isRtl,
                guidance.title,
              )}
            </h2>
            <p
              className={cn(
                "mt-4 text-sm font-medium leading-7 text-[#34413c]",
                isRtl && "font-urdu",
              )}
            >
              {localizedConfigString(
                config,
                "subtitle",
                isRtl,
                guidance.body,
              )}
            </p>
            <div className="mt-5 space-y-2">
              {guidance.cards.slice(0, 3).map((card, index) => (
                <div
                  key={card.title}
                  className={cn(
                    "grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-[#dfe6e2] bg-white p-4 shadow-sm",
                    isRtl && "grid-cols-[1fr_auto]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full bg-[#15191b] text-xs font-black text-white",
                      isRtl && "order-2",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-sm font-black text-[#111417]",
                        isRtl && "font-urdu",
                      )}
                    >
                      {card.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-xs leading-5 text-[#596661]",
                        isRtl && "font-urdu",
                      )}
                    >
                      {card.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Consult({
  consult,
  whatsappUrl,
  isRtl,
  onConsultClick,
  config,
}: {
  consult: HomepageViewModel["consult"];
  whatsappUrl: string;
  isRtl: boolean;
  onConsultClick: () => void;
  config?: SectionConfig;
}) {
  return (
    <section id="consult" className="bg-[#f2f2f2] py-11">
      <div className="container mx-auto px-4">
        <div className={cn("mx-auto max-w-xl", isRtl && "text-right")}>
          <h2
            className={cn(
              "text-[2rem] font-semibold leading-[1.05] tracking-normal text-[#171b1d]",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "headline", isRtl, consult.title)}
          </h2>
          <p
            className={cn(
              "mt-4 text-sm font-semibold leading-6 text-[#34413c]",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "subtitle", isRtl, consult.body)}
          </p>
          <div
            className={cn(
              "mt-7 grid grid-cols-[auto_1fr] gap-4",
              isRtl && "grid-cols-[1fr_auto]",
            )}
          >
            <div
              className={cn(
                "flex flex-col items-center",
                isRtl && "order-2",
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#15191b] text-sm font-black text-white">
                1
              </span>
              <span className="h-full min-h-[74px] w-px bg-[#cbd3cf]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dcda] bg-white text-sm font-black text-[#87918d]">
                2
              </span>
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-black text-[#15191b]",
                  isRtl && "font-urdu",
                )}
              >
                {localizedConfigString(
                  config,
                  "eyebrow",
                  isRtl,
                  consult.eyebrow,
                )}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5 text-[#53615c]",
                  isRtl && "font-urdu",
                )}
              >
                {localizedConfigString(
                  config,
                  "stepText",
                  isRtl,
                  consult.secondary,
                )}
              </p>
              <a
                href={configString(config, "ctaHref", whatsappUrl)}
                target="_blank"
                rel="noreferrer"
                onClick={onConsultClick}
                className={cn(
                  "group mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#15191b] px-7 py-3 text-sm font-bold text-white transition hover:bg-black",
                  isRtl && "flex-row-reverse font-urdu",
                )}
              >
                {localizedConfigString(
                  config,
                  "ctaText",
                  isRtl,
                  consult.primary,
                )}
                <ArrowIcon isRtl={isRtl} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({
  finalCta,
  isRtl,
  config,
}: {
  finalCta: HomepageViewModel["finalCta"];
  isRtl: boolean;
  config?: SectionConfig;
}) {
  return (
    <section className="bg-[#202428] py-14 text-white md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#c7e5db]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2
            className={cn(
              "text-[2.15rem] font-semibold leading-[1.05] tracking-normal md:text-5xl",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "headline", isRtl, finalCta.title)}
          </h2>
          <p
            className={cn(
              "mx-auto mt-4 max-w-md text-sm leading-7 text-white/72 md:text-base",
              isRtl && "font-urdu",
            )}
          >
            {localizedConfigString(config, "subtitle", isRtl, finalCta.body)}
          </p>
          <div
            className={cn(
              "mt-7 flex flex-col items-center justify-center gap-3",
              isRtl && "font-urdu",
            )}
          >
            <Link
              href={configString(config, "ctaHref", finalCta.primaryHref)}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#171b1d] transition hover:bg-[#eef3ef] sm:w-auto"
            >
              {localizedConfigString(
                config,
                "ctaText",
                isRtl,
                finalCta.primary,
              )}
              <ArrowIcon isRtl={isRtl} />
            </Link>
            <Link
              href={configString(
                config,
                "secondaryHref",
                finalCta.secondaryHref,
              )}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              {localizedConfigString(
                config,
                "secondaryText",
                isRtl,
                finalCta.secondary,
              )}
            </Link>
          </div>
          <div
            className={cn(
              "mt-7 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-white/70",
              isRtl && "font-urdu",
            )}
          >
            {finalCta.points.map((point) => (
              <span
                key={point}
                className={cn(
                  "inline-flex items-center gap-2",
                  isRtl && "flex-row-reverse",
                )}
              >
                <Check className="h-3.5 w-3.5 text-[#9fe0cb]" />
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Original source-name aliases retained for code that imports these sections
// directly rather than using HomepageClient's CMS switch.
export const HomepageProofBand = ProofBand;
export const ProductCard = HomepageProductCard;
export const HomepageBestsellersSection = Bestsellers;
export const HomepageResultsSection = Results;
export const HomepageResearchSection = Research;
export const HomepageMobileStickyCta = MobileStickyCta;
export const HomepageGuidanceSection = Guidance;
export const HomepageConsultSection = Consult;
export const HomepageFinalCtaSection = FinalCta;

// The deployed homepage no longer renders these older navigation/concern
// components, but their source-level exports survived in the recovered index.
export const QuickLinkTile = () => null;
export const HomepageQuickLinksSection = () => null;
export const ConcernCard = () => null;
export const HomepageConcernsSection = () => null;
