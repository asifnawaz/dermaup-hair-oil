"use client";

import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

import type { Language } from "@/lib/constants";
import { interpolate, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

interface FooterProps {
  lang: Language;
  contactEmail: string;
  whatsappUrl: string;
  paymentMethodLabels: string[];
}

const linkStyles =
  "text-sm font-medium leading-6 text-[#53615c] transition hover:text-[#171b1d]";
const headingStyles =
  "mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#7a847f]";

export function Footer({
  lang,
  contactEmail,
  whatsappUrl,
  paymentMethodLabels,
}: FooterProps) {
  const isRtl = lang === "ur";
  const handleWhatsAppClick = () => {
    analytics.whatsappClick("footer");
    window.open(whatsappUrl, "_blank");
  };

  return (
    <footer className="border-t border-[#dfe3de] bg-[#f7f5ef] text-[#171b1d]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div
            className={cn(
              "grid gap-8 border-b border-[#dfe3de] pb-9 md:grid-cols-[1.4fr_2fr]",
              isRtl && "md:direction-rtl",
            )}
          >
            <div className={cn("max-w-sm", isRtl && "text-right font-urdu")}>
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl font-semibold tracking-[0.18em] text-[#171b1d]">
                  UPDERMA
                </span>
              </Link>
              <p className="mt-4 text-sm font-medium leading-7 text-[#53615c]">
                {isRtl
                  ? "تحقیق سے متاثر، روزانہ استعمال کے قابل جلد اور بالوں کی دیکھ بھال، پاکستان کے لیے آسان روٹینز۔"
                  : "Research-inspired skin and hair care made for simple, consistent routines in Pakistan."}
              </p>
              <div
                className={cn(
                  "mt-5 flex flex-wrap gap-2",
                  isRtl && "justify-end",
                )}
              >
                {(paymentMethodLabels.length > 0
                  ? paymentMethodLabels
                  : ["COD", "Bank Transfer"]
                )
                  .slice(0, 4)
                  .map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-[#d7ddcf] bg-white px-3 py-1 text-[11px] font-bold text-[#53615c]"
                    >
                      {label}
                    </span>
                  ))}
              </div>
            </div>

            <div
              className={cn(
                "grid grid-cols-2 gap-6 sm:grid-cols-4",
                isRtl && "text-right font-urdu",
              )}
            >
              <div>
                <h4
                  className={cn(
                    headingStyles,
                    isRtl && "normal-case tracking-normal",
                  )}
                >
                  {isRtl ? "شاپ" : "Shop"}
                </h4>
                <nav className="flex flex-col gap-1.5">
                  <Link href="/products" className={linkStyles}>
                    {isRtl ? "تمام مصنوعات" : "All Products"}
                  </Link>
                  <Link
                    href="/products?category=skin_care&concern=dull_skin"
                    className={linkStyles}
                  >
                    {isRtl ? "گلو روٹین" : "Glow Routine"}
                  </Link>
                  <Link
                    href="/products?category=skin_care&concern=texture"
                    className={linkStyles}
                  >
                    {isRtl ? "رینیول روٹین" : "Renewal Routine"}
                  </Link>
                </nav>
              </div>
              <div>
                <h4
                  className={cn(
                    headingStyles,
                    isRtl && "normal-case tracking-normal",
                  )}
                >
                  {isRtl ? "مدد" : "Help"}
                </h4>
                <nav className="flex flex-col gap-1.5">
                  <Link href="/delivery-returns" className={linkStyles}>
                    {isRtl ? "ڈیلیوری" : "Delivery & Returns"}
                  </Link>
                  <Link href="/refund" className={linkStyles}>
                    {isRtl ? "رقم واپسی" : "Refund Policy"}
                  </Link>
                  <button
                    onClick={handleWhatsAppClick}
                    className={cn(
                      "inline-flex items-center gap-2 text-left",
                      linkStyles,
                      isRtl && "flex-row-reverse text-right font-urdu",
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{isRtl ? "واٹس ایپ" : "WhatsApp"}</span>
                  </button>
                </nav>
              </div>
              <div>
                <h4
                  className={cn(
                    headingStyles,
                    isRtl && "normal-case tracking-normal",
                  )}
                >
                  {isRtl ? "قانونی" : "Legal"}
                </h4>
                <nav className="flex flex-col gap-1.5">
                  <Link href="/privacy" className={linkStyles}>
                    {isRtl ? "رازداری" : "Privacy Policy"}
                  </Link>
                  <Link href="/terms" className={linkStyles}>
                    {isRtl ? "شرائط" : "Terms & Conditions"}
                  </Link>
                </nav>
              </div>
              <div>
                <h4
                  className={cn(
                    headingStyles,
                    isRtl && "normal-case tracking-normal",
                  )}
                >
                  {isRtl ? "رابطہ" : "Contact"}
                </h4>
                <nav className="flex flex-col gap-1.5">
                  <a
                    href={`mailto:${contactEmail}`}
                    className={cn(
                      "inline-flex items-center gap-2",
                      linkStyles,
                      isRtl && "flex-row-reverse font-urdu",
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    <span>{isRtl ? "ای میل" : "Email"}</span>
                  </a>
                  <button
                    onClick={handleWhatsAppClick}
                    className={cn(
                      "inline-flex items-center gap-2 text-left",
                      linkStyles,
                      isRtl && "flex-row-reverse text-right font-urdu",
                    )}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{isRtl ? "روٹین مدد" : "Routine Help"}</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col gap-3 pt-6 text-xs font-medium text-[#6a746f] md:flex-row md:items-center md:justify-between",
              isRtl && "md:flex-row-reverse font-urdu",
            )}
          >
            <p>
              {interpolate(t("footer.copyright", lang), {
                year: new Date().getFullYear(),
              })}
            </p>
            <p>
              {isRtl
                ? "روزانہ روٹینز، صاف سپورٹ، پاکستان بھر میں ڈیلیوری۔"
                : "Simple routines, clear support, delivery across Pakistan."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
