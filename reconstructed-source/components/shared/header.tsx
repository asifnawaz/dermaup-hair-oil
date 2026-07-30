"use client";

import {
  ChevronDown,
  Languages,
  Menu,
  MessageCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import type { CheckoutShippingConfig } from "@/lib/checkout-config";
import type { Language } from "@/lib/constants";
import { useCart, useCartDrawerRequest } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

import { CartDrawer } from "./cart-drawer";

interface HeaderProps {
  lang: Language;
  promoBannerText: string;
  whatsappUrl: string;
  shippingConfig: CheckoutShippingConfig;
}

export function Header({
  lang,
  promoBannerText,
  whatsappUrl,
  shippingConfig,
}: HeaderProps) {
  const isRtl = lang === "ur";
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [productsOpen, setProductsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const previousScrollY = useRef(0);
  const { itemCount } = useCart();
  const cartRequest = useCartDrawerRequest();
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeaderHeight = () =>
      setHeaderHeight(header.getBoundingClientRect().height);
    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    previousScrollY.current = window.scrollY;
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - previousScrollY.current;
      setScrolled(nextScrollY > 10);
      if (mobileOpen || cartOpen || nextScrollY < 80) setHeaderVisible(true);
      else if (delta > 8) setHeaderVisible(false);
      else if (delta < -8) setHeaderVisible(true);
      previousScrollY.current = nextScrollY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cartOpen, isProductDetail, mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (cartRequest > 0) setCartOpen(true);
  }, [cartRequest]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productsMenuRef.current &&
        !productsMenuRef.current.contains(event.target as Node)
      ) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLanguage: Language) => {
    if (newLanguage === lang) return;
    analytics.languageSwitch(lang, newLanguage);
    document.cookie = `lang=${newLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href.split("?")[0]}/`);
  const showPromo = Boolean(promoBannerText) && !isProductDetail;

  const closeProductsOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setProductsOpen(false);
    }
  };
  const closeProductsOnKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setProductsOpen(false);
      productsButtonRef.current?.focus();
    }
  };

  return (
    <>
      <div aria-hidden style={{ height: headerHeight }} />
      <header
        ref={headerRef}
        className={cn(
          "fixed left-0 top-0 z-40 w-screen max-w-[100vw] border-b border-[#30363b] bg-[#202428] text-white transition-[box-shadow,transform] duration-300 ease-out",
          headerVisible ? "translate-y-0" : "-translate-y-full",
          scrolled && "shadow-[0_12px_30px_rgba(0,0,0,0.18)]",
        )}
      >
        {showPromo && (
          <div
            data-promo-banner
            className="overflow-hidden border-b border-[#d7dcda] bg-[#eef0ef] text-[#14191b]"
          >
            <div className="px-4 py-2 text-center text-[12px] font-medium leading-snug md:hidden">
              {promoBannerText}
            </div>
            <div className="relative hidden h-8 overflow-hidden md:block">
              <div className="absolute left-0 top-0 flex min-w-max animate-marquee whitespace-nowrap py-2 text-[12px] font-medium tracking-[0.01em]">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className="contents">
                    <span className="mx-6">{promoBannerText}</span>
                    {index < 3 && (
                      <span className="mx-2 text-[#7d8782]">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "relative flex h-14 items-center justify-between md:h-16",
              isRtl && "md:flex-row-reverse",
            )}
          >
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 md:hidden"
              aria-label="Menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/"
              aria-label="UpDerma home"
              className={cn(
                "group absolute left-1/2 top-1/2 flex min-w-0 -translate-x-1/2 -translate-y-1/2 items-center text-white transition-opacity hover:opacity-90 md:static md:translate-x-0 md:translate-y-0",
                isRtl && "md:flex-row-reverse",
              )}
            >
              <Image
                src="/brand/upderma-wordmark-tm-header.png"
                alt="UpDerma"
                width={307}
                height={44}
                priority
                sizes="(max-width: 767px) 142px, 168px"
                className="h-auto w-[142px] md:w-[168px]"
              />
            </Link>
            <nav
              className={cn(
                "hidden items-center gap-1 md:flex",
                isRtl && "flex-row-reverse",
              )}
            >
              <div
                ref={productsMenuRef}
                className="relative"
                onBlur={closeProductsOnBlur}
                onKeyDown={closeProductsOnKey}
              >
                <button
                  ref={productsButtonRef}
                  onClick={() => setProductsOpen((value) => !value)}
                  aria-expanded={productsOpen}
                  aria-controls="products-navigation-panel"
                  className={cn(
                    "flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                    isActive("/products")
                      ? "bg-white/12 text-white"
                      : "text-white/72 hover:bg-white/10 hover:text-white",
                    isRtl && "flex-row-reverse font-urdu",
                  )}
                >
                  {isRtl ? "مصنوعات" : "Products"}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      productsOpen && "rotate-180",
                    )}
                  />
                </button>
                {productsOpen && (
                  <div
                    id="products-navigation-panel"
                    className={cn(
                      "absolute top-full z-50 mt-2 w-56 rounded-2xl border border-[#e3e7e4] bg-white py-2 text-[#16191b] shadow-xl",
                      isRtl ? "right-0" : "left-0",
                    )}
                  >
                    <Link
                      href="/products"
                      className={cn(
                        "flex min-h-11 items-center px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#f2f4f3]",
                        isRtl && "text-right font-urdu",
                      )}
                      onClick={() => setProductsOpen(false)}
                    >
                      {isRtl ? "تمام مصنوعات" : "All Products"}
                    </Link>
                    <div className="mx-3 my-1 h-px bg-gray-200" />
                    <Link
                      href="/products?category=hair_care"
                      className="flex min-h-11 items-center px-4 py-2.5 text-sm transition-colors hover:bg-[#f2f4f3]"
                    >
                      {isRtl ? "بالوں کی دیکھ بھال" : "Hair Care"}
                    </Link>
                    <Link
                      href="/products?category=skin_care"
                      className="flex min-h-11 items-center px-4 py-2.5 text-sm transition-colors hover:bg-[#f2f4f3]"
                    >
                      {isRtl ? "جلد کی دیکھ بھال" : "Skin Care"}
                    </Link>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  analytics.whatsappClick("header");
                  window.open(whatsappUrl, "_blank");
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/72 transition-colors hover:bg-white/10 hover:text-white",
                  isRtl && "flex-row-reverse font-urdu",
                )}
              >
                <MessageCircle className="h-4 w-4 text-[#c7e5db]" />
                {isRtl ? "رابطہ" : "Contact"}
              </button>
            </nav>
            <div
              className={cn(
                "absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2 md:static md:translate-y-0",
                isRtl && "md:flex-row-reverse",
              )}
            >
              <button
                onClick={() => switchLanguage(lang === "en" ? "ur" : "en")}
                className="hidden rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/86 transition-colors hover:bg-white/10 md:inline-flex"
                aria-label={
                  lang === "en" ? "Switch to Urdu" : "Switch to English"
                }
              >
                {lang === "en" ? "اردو" : "EN"}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c7e5db] px-1 text-[10px] font-bold text-[#171b1d]">
                    {itemCount}
                  </span>
                )}
              </button>
              <Link
                href="/products"
                className={cn(
                  "hidden h-9 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-[#171b1d] hover:bg-[#eef3ef] md:inline-flex",
                  isRtl && "font-urdu",
                )}
              >
                {isRtl ? "شاپ کریں" : "Shop Now"}
              </Link>
            </div>
          </div>
        </div>
        <div
          id="mobile-navigation"
          aria-hidden={!mobileOpen}
          className={cn(
            "overflow-hidden border-t border-white/10 bg-[#202428] text-white transition-all duration-300 md:hidden",
            mobileOpen
              ? "max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain"
              : "max-h-0 border-t-0",
          )}
        >
          {mobileOpen && (
            <nav className="container mx-auto space-y-1 px-4 py-3">
              {[
                ["/products", isRtl ? "تمام مصنوعات" : "All Products"],
                [
                  "/products?category=hair_care",
                  isRtl ? "بالوں کی دیکھ بھال" : "Hair Care",
                ],
                [
                  "/products?category=skin_care",
                  isRtl ? "جلد کی دیکھ بھال" : "Skin Care",
                ],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "block rounded-md px-3 py-2.5 text-sm text-white/78 transition-colors hover:bg-white/10 hover:text-white",
                    isRtl && "text-right font-urdu",
                  )}
                >
                  {label}
                </Link>
              ))}
              <div className="mx-3 my-2 h-px bg-white/10" />
              <div className={cn("px-3 py-2", isRtl && "text-right")}>
                <div
                  className={cn(
                    "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/52",
                    isRtl && "flex-row-reverse font-urdu-tight",
                  )}
                >
                  <Languages className="h-3.5 w-3.5" />
                  {isRtl ? "زبان" : "Language"}
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                  {(["en", "ur"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => switchLanguage(option)}
                      aria-current={lang === option ? "true" : undefined}
                      className={cn(
                        "min-h-11 rounded-full px-3 text-sm font-semibold transition-colors",
                        lang === option
                          ? "bg-white text-[#171b1d]"
                          : "text-white/72 hover:bg-white/10 hover:text-white",
                        option === "ur" && "font-urdu-tight",
                      )}
                    >
                      {option === "en" ? "English" : "اردو"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mx-3 my-2 h-px bg-white/10" />
              <button
                onClick={() => {
                  analytics.whatsappClick("mobile_nav");
                  window.open(whatsappUrl, "_blank");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#c7e5db] transition-colors hover:bg-white/10",
                  isRtl && "flex-row-reverse text-right font-urdu",
                )}
              >
                <MessageCircle className="h-4 w-4" />
                {isRtl ? "واٹس ایپ پر رابطہ کریں" : "Chat on WhatsApp"}
              </button>
            </nav>
          )}
        </div>
      </header>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lang={lang}
        shippingConfig={shippingConfig}
      />
    </>
  );
}
