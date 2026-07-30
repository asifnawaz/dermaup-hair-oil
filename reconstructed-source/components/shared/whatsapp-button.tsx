"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { Language } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/store-settings";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

interface WhatsAppButtonProps {
  lang: Language;
  isRtl?: boolean;
  whatsappUrl: string;
}

function getWhatsAppNumberFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "wa.me") {
      return parsed.pathname.replace(/^\/+/, "").split("/")[0] || null;
    }
  } catch {
    return url.match(/wa\.me\/([^?/#]+)/)?.[1] || null;
  }
  return null;
}

function getProductNameFromPath(pathname: string): string {
  return (pathname.split("/").filter(Boolean).at(-1) || "this product")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProductWhatsAppUrl(
  whatsappUrl: string,
  pathname: string,
): string {
  const number = getWhatsAppNumberFromUrl(whatsappUrl);
  if (!number) return whatsappUrl;
  return buildWhatsAppUrl(
    number,
    `Hi UpDerma, I have a question about the ${getProductNameFromPath(pathname)}.`,
  );
}

export function WhatsAppButton({
  lang,
  isRtl = false,
  whatsappUrl,
}: WhatsAppButtonProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCheckout = pathname === "/checkout";
  const isProducts = pathname === "/products";
  const isProductDetail = pathname.startsWith("/products/");
  const showLabel = !isProductDetail;
  const [showCheckoutHelp, setShowCheckoutHelp] = useState(false);
  const [productVisible, setProductVisible] = useState(false);

  useEffect(() => {
    if (!isCheckout) {
      setShowCheckoutHelp(false);
      return;
    }
    const timeout = window.setTimeout(() => setShowCheckoutHelp(true), 60_000);
    return () => window.clearTimeout(timeout);
  }, [isCheckout]);

  useEffect(() => {
    if (!isProductDetail) {
      setProductVisible(true);
      return;
    }
    let lastScrollY = window.scrollY;
    let frame = 0;
    setProductVisible(false);
    const updateVisibility = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const nextScrollY = window.scrollY;
        const delta = nextScrollY - lastScrollY;
        if (nextScrollY < 320) setProductVisible(false);
        else if (delta < -8) setProductVisible(true);
        else if (delta > 8) setProductVisible(false);
        lastScrollY = nextScrollY;
        frame = 0;
      });
    };
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateVisibility);
    };
  }, [isProductDetail]);

  const href = isProductDetail
    ? getProductWhatsAppUrl(whatsappUrl, pathname)
    : whatsappUrl;
  const visible = !isProductDetail || productVisible;
  if (isHome || (isCheckout && !showCheckoutHelp)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        analytics.whatsappClick(isCheckout ? "checkout-help" : "floating-button")
      }
      aria-hidden={isProductDetail ? !visible : undefined}
      tabIndex={visible ? undefined : -1}
      className={cn(
        "fixed flex-col items-center gap-0.5 transition-all hover:scale-110",
        isProducts ? "hidden sm:flex" : "flex",
        isProductDetail &&
          (productVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"),
        isProductDetail
          ? "bottom-24 right-4 z-50 sm:bottom-6 sm:right-6"
          : cn(
              "z-40",
              isCheckout ? "bottom-20 animate-fade-in sm:bottom-6" : "bottom-6",
              isRtl ? "left-6" : "right-6",
            ),
      )}
      aria-label={lang === "ur" ? "واٹس ایپ پر چیٹ کریں" : "Chat on WhatsApp"}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800",
          isProductDetail
            ? "h-11 w-11 sm:h-14 sm:w-14"
            : "h-14 w-14",
        )}
      >
        <MessageCircle
          className={cn(
            isProductDetail ? "h-5 w-5 sm:h-7 sm:w-7" : "h-7 w-7",
          )}
        />
      </span>
      {showLabel && (
        <span
          className={cn(
            "rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-sm",
            isCheckout ? "text-green-700" : "text-gray-600",
          )}
        >
          {isCheckout
            ? lang === "ur"
              ? "مدد چاہیے؟"
              : "Need help?"
            : lang === "ur"
              ? "چیٹ"
              : "Chat"}
        </span>
      )}
    </a>
  );
}
