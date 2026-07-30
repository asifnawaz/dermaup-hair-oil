"use client";

/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from production client chunk 7338 (module 77338) and checked
 * against the surviving source index. Trigger thresholds, validation,
 * bilingual copy, markup, and analytics calls match the deployed component.
 */

import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Gift,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import type { Language } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

export interface ExitIntentPopupProps {
  lang: Language;
  config?: Record<string, string>;
}

const STORAGE_KEY = "upderma_exit_popup_shown";
const MIN_TIME_ON_PAGE_MS = 15_000;
const MIN_SCROLL_FOR_POPUP = 240;
const INACTIVITY_DELAY_MS = 45_000;

export function ExitIntentPopup({
  lang,
  config,
}: ExitIntentPopupProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const discountCode = config?.discountCode || "FIRST10";
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const isRtl = lang === "ur";

  const copy = {
    en: {
      headline: "WAIT! Here's 10% OFF",
      subheadline:
        "Enter your WhatsApp number to get your exclusive discount code",
      phonePlaceholder: "03XX-XXXXXXX",
      phoneLabel: "WhatsApp Number",
      emailPlaceholder: "your@email.com (optional)",
      addEmail: "+ Add email too",
      submitButton: "Send My Discount Code via WhatsApp",
      noThanks: "No thanks, I'll pay full price",
      success: "We'll send your discount code on WhatsApp!",
      codeLabel: "Or use this code now:",
      successButton: "Start Shopping",
      sending: "Sending...",
      errorRequired: "Please enter your WhatsApp number",
      errorInvalid: "Enter a valid number (03XX-XXXXXXX)",
      errorGeneric: "Something went wrong. Please try again.",
    },
    ur: {
      headline: "رکیں! 10% چھوٹ لیں",
      subheadline:
        "ڈسکاؤنٹ کوڈ حاصل کرنے کے لیے واٹس ایپ نمبر درج کریں",
      phonePlaceholder: "03XX-XXXXXXX",
      phoneLabel: "واٹس ایپ نمبر",
      emailPlaceholder: "ای میل (اختیاری)",
      addEmail: "+ ای میل بھی شامل کریں",
      submitButton: "واٹس ایپ پر ڈسکاؤنٹ کوڈ بھیجیں",
      noThanks: "نہیں شکریہ، میں پوری قیمت دوں گا",
      success: "ہم آپ کو واٹس ایپ پر ڈسکاؤنٹ کوڈ بھیجیں گے!",
      codeLabel: "یا ابھی یہ کوڈ استعمال کریں:",
      successButton: "خریداری شروع کریں",
      sending: "بھیج رہا ہے...",
      errorRequired: "براہ کرم واٹس ایپ نمبر درج کریں",
      errorInvalid: "درست نمبر درج کریں (03XX-XXXXXXX)",
      errorGeneric: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    },
  }[lang];

  const headline =
    (isRtl ? config?.headlineUr : config?.headline) || copy.headline;
  const subheadline =
    (isRtl ? config?.subtitleUr : config?.subtitle) || copy.subheadline;
  const shouldSkip =
    itemCount > 0 ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/thank-you");

  const showPopup = useCallback(() => {
    if (shouldSkip) return;

    const lastShown = localStorage.getItem(STORAGE_KEY);
    if (
      lastShown &&
      (Date.now() - Number.parseInt(lastShown, 10)) / 3_600_000 < 24
    ) {
      return;
    }

    setIsOpen(true);
    analytics.exitIntentShown();
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, [shouldSkip]);

  useEffect(() => {
    let inactivityTimeout: ReturnType<typeof setTimeout> | undefined;
    let triggered = false;
    const enteredAt = Date.now();

    const canShowPopup = () =>
      !shouldSkip &&
      Date.now() - enteredAt >= MIN_TIME_ON_PAGE_MS &&
      window.scrollY >= MIN_SCROLL_FOR_POPUP;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0 && !triggered && canShowPopup()) {
        triggered = true;
        showPopup();
      }
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        if (!triggered && canShowPopup()) {
          triggered = true;
          showPopup();
        }
      }, INACTIVITY_DELAY_MS);
    };

    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (
        lastScrollY > 700 &&
        currentScrollY < 160 &&
        !triggered &&
        canShowPopup()
      ) {
        triggered = true;
        showPopup();
      }
      lastScrollY = currentScrollY;
      resetInactivityTimer();
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    resetInactivityTimer();

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(inactivityTimeout);
    };
  }, [showPopup, shouldSkip]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      setError(copy.errorRequired);
      return;
    }
    if (!/^(03\d{9}|923\d{9}|\+923\d{9})$/.test(cleanPhone)) {
      setError(copy.errorInvalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          email: email || undefined,
          source: "exit_popup",
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        analytics.exitIntentConverted();
      } else {
        setError(copy.errorGeneric);
      }
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          "relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slide-up",
          isRtl && "font-urdu",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors text-slate-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-slate-900 px-6 py-7 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{headline}</h2>
          <p className="text-sm opacity-90">{subheadline}</p>
        </div>

        <div className="p-5">
          {isSubmitted ? (
            <div className="text-center py-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-base font-semibold mb-1">{copy.success}</p>
              <div className="bg-primary/10 rounded-xl p-4 my-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {copy.codeLabel}
                </p>
                <p className="text-2xl font-bold text-primary tracking-wider">
                  {discountCode}
                </p>
              </div>
              <Button
                onClick={handleClose}
                variant="default"
                className="w-full"
              >
                {copy.successButton}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  className={cn(
                    "block text-xs font-medium text-gray-600 mb-1",
                    isRtl && "text-right",
                  )}
                >
                  <MessageCircle className="h-3 w-3 inline mr-1 text-green-600" />
                  {copy.phoneLabel}
                </label>
                <Input
                  type="tel"
                  placeholder={copy.phonePlaceholder}
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                  className="text-base"
                  dir="ltr"
                  autoComplete="tel"
                />
                {error && (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                )}
              </div>

              {showEmail ? (
                <div>
                  <Input
                    type="email"
                    placeholder={copy.emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="text-sm"
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmail(true)}
                  className="text-xs text-primary hover:underline"
                >
                  {copy.addEmail}
                </button>
              )}

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  copy.sending
                ) : (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {copy.submitButton}
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                {copy.noThanks}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
