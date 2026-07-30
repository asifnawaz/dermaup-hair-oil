"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";

import { addToCart } from "../../lib/cart-store";
import { getPublicProductPackageEntries } from "../../lib/content";
import {
  CheckItem,
  configImages,
  formatPrice,
  isRtl,
  productDescription,
  productName,
  readBoolean,
  readNumber,
  readString,
  readText,
  Stars,
  TrustPill,
} from "./shared";
import type { ProductHeroProps } from "./types";

type GalleryProps = {
  images: string[];
  displayName: string;
  badge?: string;
  avgRating: string;
  reviewCount: string;
  ratingSummaryText: string;
  ratingBandText: string;
  galleryAspect: string;
  galleryObjectFit: "contain" | "cover";
};

export function ProductImageGallery({
  images,
  displayName,
  badge,
  avgRating,
  reviewCount,
  ratingSummaryText,
  ratingBandText,
  galleryAspect,
  galleryObjectFit,
}: GalleryProps) {
  const [active, setActive] = useState(0);
  const image = images[active] || images[0];

  const move = (direction: -1 | 1) => {
    setActive((current) => {
      const next = current + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-[#F4F2EE]"
        style={{ aspectRatio: galleryAspect }}
      >
        {image ? (
          <Image
            alt={`${displayName} ${active + 1}`}
            className={galleryObjectFit === "contain" ? "object-contain p-3" : "object-cover"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={image}
          />
        ) : null}
        {badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-900 shadow">
            {badge}
          </span>
        ) : null}
        {images.length > 1 ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow"
              onClick={() => move(-1)}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow"
              onClick={() => move(1)}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
      {ratingBandText ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-950 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Stars />
            <span className="text-xs font-semibold">{avgRating}</span>
          </div>
          <span className="text-xs font-medium">{ratingBandText}</span>
        </div>
      ) : null}
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((thumbnail, index) => (
            <button
              aria-label={`Show product image ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-stone-100 ${
                index === active ? "border-stone-950" : "border-transparent"
              }`}
              key={`${thumbnail}-${index}`}
              onClick={() => setActive(index)}
              type="button"
            >
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="20vw"
                src={thumbnail}
              />
            </button>
          ))}
        </div>
      ) : null}
      {ratingSummaryText ? (
        <p className="mt-3 text-center text-xs font-medium text-stone-600">
          <Star className="mr-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {ratingSummaryText || `${reviewCount} reviews`}
        </p>
      ) : null}
    </div>
  );
}

export function DermatologistCtaProof({
  images,
  text,
  linkText,
  href,
}: {
  images: string[];
  text: string;
  linkText: string;
  href: string;
  isRtl?: boolean;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-950">
      <div className="flex -space-x-2">
        {images.slice(0, 3).map((image) => (
          <Image
            alt=""
            className="h-9 w-9 rounded-full border-2 border-white object-cover"
            height={36}
            key={image}
            src={image}
            width={36}
          />
        ))}
      </div>
      <p className="leading-5">
        {text}{" "}
        <Link className="font-semibold underline" href={href}>
          {linkText}
        </Link>
      </p>
    </div>
  );
}

export function ProductHeroSection({
  lang,
  config,
  product,
  selectedPackage,
  onSelectPackage,
  testimonialCount = 0,
  avgRating = "5.0",
}: ProductHeroProps) {
  const rtl = isRtl(lang);
  const packages = useMemo(
    () => getPublicProductPackageEntries(product.parsedData.packages),
    [product.parsedData.packages],
  );
  const activeEntry =
    packages.find(([id]) => id === selectedPackage) || packages[0];
  const [packageId, activePackage] = activeEntry || ["single", undefined];
  const displayName = productName(product, lang);
  const images = configImages(config, product);
  const description = productDescription(product, lang);
  const title = readText(config, "heroDisplayTitle", lang, displayName);
  const subtitle = readText(config, "heroSubheadlineText", lang, description);
  const reviewCount = String(readNumber(config, "reviewCount", testimonialCount));
  const galleryAspect = readString(config?.galleryAspect, "4 / 5");
  const objectFit =
    readString(config?.galleryObjectFit, "cover") === "contain"
      ? "contain"
      : "cover";
  const ctaText = readText(config, "simpleCtaText", lang, lang === "ur" ? "کارٹ میں شامل کریں" : "Add to Cart");
  const showSelector = readBoolean(config, "showPackageSelector", packages.length > 1);

  const handleAdd = () => {
    if (!activePackage) return;
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productNameUr: product.nameUr || undefined,
      productImage: product.imageUrl || undefined,
      packageType: packageId,
      packageName: activePackage.name || packageId,
      packageNameUr: activePackage.nameUr,
      unitPrice: Number(activePackage.price),
      originalPrice: Number(activePackage.originalPrice || activePackage.price),
      bottles: Number(activePackage.bottles || 1),
      isPreorder: product.parsedData.preorderEnabled === true,
      preorderNote: readString(product.parsedData.preorderNote),
      preorderNoteUr: readString(product.parsedData.preorderNoteUr),
    });
  };

  const bullets = [1, 2, 3]
    .map((index) => readText(config, `heroBullet${index}`, lang))
    .filter(Boolean);
  const trusts = [
    readText(config, "trustItem1", lang),
    readText(config, "trustItem2", lang),
    readText(config, "trustItem3", lang),
    readText(config, "trustItemResults", lang),
  ].filter(Boolean);
  const jumpLinks = Array.from({ length: 6 }, (_, index) => ({
    label: readText(config, `jump${index + 1}Label`, lang),
    href: readString(config?.[`jump${index + 1}Href`]),
  })).filter((item) => item.label && item.href);

  return (
    <section
      className="scroll-mt-20 bg-white pb-10 pt-5 md:pb-16 md:pt-8"
      dir={rtl ? "rtl" : "ltr"}
      id={readString(config?.sectionId, "hero-product")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-12">
          <ProductImageGallery
            avgRating={avgRating}
            badge={readText(config, "badgeText", lang, product.badge || "")}
            displayName={displayName}
            galleryAspect={galleryAspect}
            galleryObjectFit={objectFit}
            images={images}
            ratingBandText={
              readBoolean(config, "showGalleryRatingBand", false)
                ? readText(config, "galleryRatingLabel", lang)
                : ""
            }
            ratingSummaryText={readText(config, "heroRatingSummaryText", lang)}
            reviewCount={reviewCount}
          />
          <div className="lg:sticky lg:top-24">
            {readText(config, "heroEyebrowText", lang) ? (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">
                {readText(config, "heroEyebrowText", lang)}
              </p>
            ) : null}
            <h1 className="font-serif text-[2rem] font-semibold leading-[1.06] tracking-tight text-stone-950 md:text-5xl">
              {title}
            </h1>
            {readText(config, "microBadgeText", lang) ? (
              <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                {readText(config, "microBadgeText", lang)}
              </span>
            ) : null}
            <p className="mt-4 text-base leading-7 text-stone-600">
              {subtitle}
            </p>
            {reviewCount !== "0" ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600">
                <Stars rating={Number(avgRating)} />
                <span>{avgRating}</span>
                <span>•</span>
                <span>
                  {readText(config, "galleryRatingLabel", lang, `${reviewCount} reviews`)}
                </span>
              </div>
            ) : null}
            {bullets.length ? (
              <ul className="mt-5 space-y-2.5">
                {bullets.map((bullet) => (
                  <CheckItem key={bullet}>{bullet}</CheckItem>
                ))}
              </ul>
            ) : null}
            {showSelector && packages.length > 1 ? (
              <div className="mt-6 space-y-2">
                {packages.map(([id, item]) => {
                  const selected = id === packageId;
                  return (
                    <button
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-start transition ${
                        selected
                          ? "border-stone-950 bg-stone-50 ring-1 ring-stone-950"
                          : "border-stone-200 bg-white"
                      }`}
                      key={id}
                      onClick={() => onSelectPackage(id)}
                      type="button"
                    >
                      <span>
                        <strong className="block text-sm text-stone-950">
                          {rtl && item.nameUr ? item.nameUr : item.name || id}
                        </strong>
                        {item.supply ? (
                          <span className="mt-1 block text-xs text-stone-500">
                            {rtl && item.supplyUr ? String(item.supplyUr) : String(item.supply)}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm font-bold text-stone-950">
                        {formatPrice(Number(item.price))}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {activePackage ? (
              <div className="mt-6 flex items-end gap-3">
                <strong className="text-2xl text-stone-950">
                  {formatPrice(Number(activePackage.price))}
                </strong>
                {Number(activePackage.originalPrice) > Number(activePackage.price) ? (
                  <span className="pb-0.5 text-sm text-stone-400 line-through">
                    {formatPrice(Number(activePackage.originalPrice))}
                  </span>
                ) : null}
              </div>
            ) : null}
            <button
              className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-950 disabled:opacity-50"
              disabled={!activePackage}
              onClick={handleAdd}
              type="button"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {ctaText}
            </button>
            {readText(config, "simpleCtaNote", lang) &&
            readBoolean(config, "showSimpleCtaNote", false) ? (
              <p className="mt-3 text-center text-xs leading-5 text-stone-500">
                {readText(config, "simpleCtaNote", lang)}
              </p>
            ) : null}
            {readBoolean(config, "showPostCtaTrustBadges", true) ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5]
                  .map((index) => readText(config, `postCtaTrustBadge${index}`, lang))
                  .filter(Boolean)
                  .map((item) => (
                    <TrustPill key={item}>{item}</TrustPill>
                  ))}
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-stone-600">
              <span className="rounded-xl bg-stone-50 p-3">
                <CircleDollarSign className="mx-auto mb-1 h-5 w-5 text-emerald-800" />
                {readText(config, "codBadgeText", lang, "COD Available")}
              </span>
              <span className="rounded-xl bg-stone-50 p-3">
                <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-emerald-800" />
                {readText(config, "heroGuaranteeText", lang, "90-day guarantee")}
              </span>
              <span className="rounded-xl bg-stone-50 p-3">
                <PackageCheck className="mx-auto mb-1 h-5 w-5 text-emerald-800" />
                {lang === "ur" ? "محفوظ ڈیلیوری" : "Secure delivery"}
              </span>
            </div>
            {readBoolean(config, "showHeroAccordions", true) ? (
              <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
                {[1, 2, 3, 4].map((index) => {
                  const accordionTitle = readText(config, `accordion${index}Title`, lang);
                  const body = readText(config, `accordion${index}Body`, lang);
                  if (!accordionTitle || !body) return null;
                  return (
                    <details className="group py-1" key={accordionTitle}>
                      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-stone-950">
                        {accordionTitle}
                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                      </summary>
                      <p className="pb-4 text-sm leading-6 text-stone-600">{body}</p>
                    </details>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {readBoolean(config, "showHeroJumpLinks", true) && jumpLinks.length ? (
          <nav
            aria-label="Product page sections"
            className="mt-8 flex snap-x gap-2 overflow-x-auto border-y border-stone-200 py-3"
          >
            {jumpLinks.map((item) => (
              <Link
                className="shrink-0 snap-start rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-800"
                href={item.href}
                key={`${item.href}-${item.label}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
