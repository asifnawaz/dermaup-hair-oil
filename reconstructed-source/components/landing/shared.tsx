import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Star,
} from "lucide-react";

import type {
  LandingConfig,
  Language,
  ParsedContentBlock,
  ParsedProduct,
} from "./types";

export function isRtl(lang: Language): boolean {
  return lang === "ur";
}

export function readText(
  config: LandingConfig | null | undefined,
  key: string,
  lang: Language,
  fallback = "",
): string {
  const localized = lang === "ur" ? config?.[`${key}Ur`] : undefined;
  const value = localized || config?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function readString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function readBoolean(
  config: LandingConfig | null | undefined,
  key: string,
  fallback = false,
): boolean {
  const value = config?.[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
}

export function readNumber(
  config: LandingConfig | null | undefined,
  key: string,
  fallback = 0,
): number {
  const value = Number(config?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

export function localizedBlockText(
  block: ParsedContentBlock,
  key: string,
  lang: Language,
  fallbackKey?: string,
): string {
  const data = block.parsedData;
  const localizedKey = lang === "ur" ? `${key}Ur` : key;
  return readString(
    data[localizedKey],
    readString(data[key], fallbackKey ? readString(data[fallbackKey]) : ""),
  );
}

export function productName(product: ParsedProduct, lang: Language): string {
  return lang === "ur" && product.nameUr ? product.nameUr : product.name;
}

export function productDescription(
  product: ParsedProduct,
  lang: Language,
): string {
  if (lang === "ur") {
    return (
      product.shortDescriptionUr ||
      readString(product.parsedData.descriptionUr) ||
      product.shortDescription ||
      ""
    );
  }
  return (
    product.shortDescription ||
    readString(product.parsedData.description) ||
    ""
  );
}

export function formatPrice(price: number): string {
  return `PKR ${Math.round(price).toLocaleString("en-PK")}`;
}

export function usableImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    (value.startsWith("/") || /^https?:\/\//i.test(value))
  );
}

export function configImages(
  config: LandingConfig | null | undefined,
  product?: ParsedProduct | null,
): string[] {
  const values = [
    config?.galleryLeadImage,
    config?.galleryImage1,
    config?.galleryImage2,
    config?.galleryImage3,
    config?.galleryImage4,
    config?.galleryImage5,
  ];

  if (readBoolean(config, "includePrimaryImageInGallery", false)) {
    values.unshift(product?.imageUrl);
  }

  const gallery = Array.isArray(product?.parsedData.galleryImages)
    ? product.parsedData.galleryImages
    : [];

  return [...values, ...gallery, product?.imageUrl]
    .filter(usableImage)
    .filter((value, index, array) => array.indexOf(value) === index);
}

export function Stars({
  rating = 5,
  className = "",
}: {
  rating?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-amber-400 ${className}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          aria-hidden="true"
          className="h-3.5 w-3.5 fill-current"
          key={index}
          strokeWidth={1.5}
          opacity={index + 1 <= Math.round(rating) ? 1 : 0.35}
        />
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  inverted = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  inverted?: boolean;
}) {
  return (
    <header className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${
          inverted ? "text-emerald-300" : "text-emerald-800"
        }`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`font-serif text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl ${
        inverted ? "text-white" : "text-stone-950"
      }`}>
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-4 text-base leading-7 md:text-lg ${
          inverted ? "text-stone-300" : "text-stone-600"
        }`}>
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function SectionShell({
  id,
  children,
  tone = "white",
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "white" | "cream" | "dark" | "sage";
  className?: string;
}) {
  const toneClass = {
    white: "bg-white text-stone-950",
    cream: "bg-[#F8F6F1] text-stone-950",
    sage: "bg-[#EEF3EE] text-stone-950",
    dark: "bg-stone-950 text-white",
  }[tone];

  return (
    <section
      className={`scroll-mt-24 border-y border-stone-200 py-12 md:py-20 ${toneClass} ${className}`}
      id={id}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function ConfiguredItems({
  config,
  lang,
  count = 4,
  className = "mt-8 grid gap-4 md:grid-cols-2",
}: {
  config?: LandingConfig | null;
  lang: Language;
  count?: number;
  className?: string;
}) {
  const items = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      badge: readText(config, `item${number}Badge`, lang),
      title: readText(config, `item${number}Title`, lang),
      description: readText(config, `item${number}Description`, lang),
      image: readString(config?.[`item${number}Image`]),
      imageAlt: readText(config, `item${number}ImageAlt`, lang),
    };
  }).filter((item) => item.title || item.description || item.image);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <article
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          key={`${item.title}-${index}`}
        >
          {usableImage(item.image) ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
              <Image
                alt={item.imageAlt || item.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={item.image}
              />
            </div>
          ) : null}
          <div className="p-5 md:p-6">
            {item.badge ? (
              <span className="mb-3 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700">
                {item.badge}
              </span>
            ) : null}
            {item.title ? (
              <h3 className="text-lg font-semibold leading-snug text-stone-950">
                {item.title}
              </h3>
            ) : null}
            {item.description ? (
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {item.description}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
  light = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
        light
          ? "bg-white text-stone-950 hover:bg-stone-100"
          : "bg-stone-950 text-white hover:bg-emerald-950"
      } ${className}`}
      href={href}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm">
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
      {children}
    </span>
  );
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-stone-700">
      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function ProductCard({
  product,
  lang,
}: {
  product: ParsedProduct;
  lang: Language;
}) {
  const packages = Object.values(product.parsedData.packages || {}).filter(
    (item) => item && item.hidden !== true,
  );
  const startingPrice = packages.reduce(
    (lowest, item) => Math.min(lowest, Number(item.price) || Infinity),
    Infinity,
  );

  return (
    <Link
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          <Image
            alt={productName(product, lang)}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(max-width: 768px) 80vw, 33vw"
            src={product.imageUrl}
          />
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-stone-950">
          {productName(product, lang)}
        </h3>
        {Number.isFinite(startingPrice) ? (
          <p className="mt-2 text-sm font-semibold text-emerald-900">
            {formatPrice(startingPrice)}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
          {lang === "ur" ? "تفصیل دیکھیں" : "View product"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function GenericConfiguredSection({
  lang,
  config,
  tone = "white",
  defaultTitle,
}: {
  lang: Language;
  config?: LandingConfig | null;
  tone?: "white" | "cream" | "dark" | "sage";
  defaultTitle: string;
}) {
  const title = readText(
    config,
    "title",
    lang,
    readText(config, "headline", lang, defaultTitle),
  );
  const subtitle = readText(
    config,
    "subtitle",
    lang,
    readText(config, "description", lang),
  );
  const id = readString(config?.sectionId);

  return (
    <SectionShell id={id || undefined} tone={tone}>
      <SectionHeading
        eyebrow={readText(config, "eyebrow", lang)}
        inverted={tone === "dark"}
        title={title}
        subtitle={subtitle}
      />
      <ConfiguredItems config={config} lang={lang} />
      {readText(config, "ctaText", lang) ? (
        <div className="mt-8 text-center">
          <PrimaryLink href={readString(config?.ctaHref, "#hero-product")}>
            {readText(config, "ctaText", lang)}
          </PrimaryLink>
        </div>
      ) : null}
    </SectionShell>
  );
}
