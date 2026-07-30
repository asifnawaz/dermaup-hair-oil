"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ImageIcon,
  LoaderCircle,
  Mail,
  MessageCircle,
  Package,
  Percent,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { CheckoutConfig } from "@/lib/checkout-config";
import { PAKISTAN_CITIES, type Language } from "@/lib/constants";
import { interpolate, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

interface CheckoutPageClientProps {
  lang: Language;
  initialConfig: CheckoutConfig;
}

type CheckoutFormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  paymentMethod: string;
};

type CouponResult = {
  code: string;
  discount: number;
  description?: string;
};

type CouponValidationResponse =
  | {
      success: true;
      data: CouponResult;
    }
  | {
      success: false;
      error?: string;
    };

type CreateOrderResponse =
  | {
      success: true;
      data: {
        orderNumber: string;
      };
    }
  | {
      success: false;
      error?: string;
    };

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits.length > 4
    ? `${digits.slice(0, 4)}-${digits.slice(4)}`
    : digits;
}

export default function CheckoutPageClient({
  lang,
  initialConfig: config,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, itemCount, subtotal, savings, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [codConfirmed, setCodConfirmed] = useState(true);
  const [showCoupon, setShowCoupon] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [website, setWebsite] = useState("");
  const [touched, setTouched] = useState<
    Partial<Record<keyof CheckoutFormState, boolean>>
  >({});
  const [form, setForm] = useState<CheckoutFormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    city: "",
    address: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    router.prefetch("/thank-you");
  }, [router]);

  useEffect(() => {
    if (items.length > 0) {
      analytics.initiateCheckout(
        items.map((item) => ({
          id: item.productId,
          name: item.productName,
          price: item.unitPrice,
        })),
        subtotal,
      );
    }
    // Production sends this once when checkout mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      const filledFields = Object.entries(form)
        .filter(([, value]) => value.length > 0)
        .map(([field]) => field);
      if (filledFields.length > 0) {
        analytics.checkoutAbandoned(subtotal, filledFields);
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, subtotal]);

  useEffect(() => {
    if (!config.autoApplyCoupon || coupon) return;

    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: config.autoApplyCoupon,
        subtotal,
      }),
    })
      .then(
        (response) =>
          response.json() as Promise<CouponValidationResponse>,
      )
      .then((data) => {
        if (data.success) {
          setCoupon({
            code: data.data.code,
            discount: data.data.discount,
            description: data.data.description,
          });
          analytics.couponAttempt(
            data.data.code,
            true,
            data.data.discount,
          );
        }
      })
      .catch(() => {});
  }, [config.autoApplyCoupon, coupon, subtotal]);

  useEffect(() => {
    if (!config.paymentMethods[form.paymentMethod]) {
      const fallback = config.paymentMethods.cod
        ? "cod"
        : Object.keys(config.paymentMethods)[0] || "cod";
      setForm((current) => ({
        ...current,
        paymentMethod: fallback,
      }));
    }
  }, [config.paymentMethods, form.paymentMethod]);

  const isRtl = lang === "ur";
  const isCod = form.paymentMethod === "cod";
  const codMethod =
    config.paymentMethods.cod ||
    Object.values(config.paymentMethods).find(
      (method) => method.id === "cod",
    ) ||
    null;
  const selectedMethod = config.paymentMethods[form.paymentMethod];
  const requiresVerification =
    selectedMethod?.requiresVerification === true;
  const selectedDeliveryFee = Math.max(
    0,
    Math.round(selectedMethod?.deliveryFee || 0),
  );
  const prepaidMethods = Object.values(config.paymentMethods).filter(
    (method) => method.id !== "cod",
  );
  const freeShipping = subtotal >= config.freeShippingThreshold;
  const deliveryFee = isCod
    ? freeShipping
      ? 0
      : config.codDeliveryFee
    : selectedDeliveryFee;
  const prepaidDiscount = isCod
    ? 0
    : Math.round(subtotal * (config.prepaidDiscountPercent / 100));
  const couponDiscount = coupon?.discount || 0;
  const total =
    subtotal + deliveryFee - couponDiscount - prepaidDiscount;

  function handleInputChange(
    field: keyof CheckoutFormState,
    value: string,
  ) {
    const nextValue =
      field === "customerPhone" ? formatPhoneInput(value) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    if (error) setError("");
  }

  function handleFieldFocus(field: keyof CheckoutFormState) {
    analytics.checkoutFieldInteraction(field, "focus");
  }

  function handleFieldBlur(field: keyof CheckoutFormState) {
    setTouched((current) => ({ ...current, [field]: true }));
    const value = form[field];
    if (value?.length > 0) {
      analytics.checkoutFieldInteraction(field, "complete");
    }
  }

  function fieldValid(
    field: keyof CheckoutFormState,
  ): boolean | null {
    if (!touched[field]) return null;
    const value = form[field];
    switch (field) {
      case "customerName":
        return value.length >= 3;
      case "customerPhone":
        return /^(03\d{2}-?\d{7}|03\d{9})$/.test(
          value.replace(/\s/g, ""),
        );
      case "city":
        return value.length > 0;
      case "address":
        return value.length >= 10;
      case "customerEmail":
        return !value || /\S+@\S+\.\S+/.test(value);
      default:
        return null;
    }
  }

  function fieldBorderCls(field: keyof CheckoutFormState): string {
    const valid = fieldValid(field);
    return valid === null
      ? "border-gray-200"
      : valid
        ? "border-emerald-400"
        : "border-red-400";
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal,
        }),
      });
      const data =
        (await response.json()) as CouponValidationResponse;

      if (data.success) {
        setCoupon({
          code: data.data.code,
          discount: data.data.discount,
          description: data.data.description,
        });
        setCouponInput("");
        analytics.couponAttempt(
          data.data.code,
          true,
          data.data.discount,
        );
      } else {
        setCouponError(data.error || "Invalid coupon");
        analytics.couponAttempt(couponInput.trim(), false);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  }

  function validateForm(): string | null {
    if (!form.customerName || form.customerName.length < 3) {
      analytics.checkoutValidationError("customerName");
      return t("checkout.validation.name", lang);
    }
    const phone = form.customerPhone.replace(/[\s-]/g, "");
    if (
      !phone ||
      !/^(03\d{9}|923\d{9}|\+923\d{9})$/.test(phone)
    ) {
      analytics.checkoutValidationError("customerPhone");
      return t("checkout.validation.phone", lang);
    }
    if (
      form.customerEmail &&
      !/\S+@\S+\.\S+/.test(form.customerEmail)
    ) {
      analytics.checkoutValidationError("customerEmail");
      return t("checkout.validation.email", lang);
    }
    if (!form.city) {
      analytics.checkoutValidationError("city");
      return t("checkout.validation.city", lang);
    }
    if (!form.address || form.address.length < 10) {
      analytics.checkoutValidationError("address");
      return t("checkout.validation.address", lang);
    }
    if (isCod && !codConfirmed) {
      analytics.checkoutValidationError("codConfirmed");
      return t("checkout.validation.codConfirmed", lang);
    }
    return null;
  }

  async function handleSubmitOrder() {
    analytics.checkoutSubmitAttempt(total, form.paymentMethod);
    if (website) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerPhone: form.customerPhone.replace(/[-\s]/g, ""),
          language: lang,
          couponCode: coupon?.code || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            packageType: item.packageType,
            quantity: item.quantity,
          })),
        }),
      });
      const data = (await response.json()) as CreateOrderResponse;

      if (data.success) {
        analytics.purchase(
          data.data.orderNumber,
          total,
          items.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            quantity: item.quantity,
          })),
          form.paymentMethod,
        );
        clearCart();
        router.push(
          `/thank-you?orderId=${encodeURIComponent(
            data.data.orderNumber,
          )}`,
        );
      } else {
        setError(
          data.error || t("checkout.failedOrderError", lang),
        );
      }
    } catch {
      setError(t("checkout.networkError", lang));
    } finally {
      setSubmitting(false);
    }
  }

  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1
            className={cn(
              "text-2xl font-bold",
              isRtl && "font-urdu",
            )}
          >
            {t("cart.empty", lang)}
          </h1>
          <Button asChild>
            <Link href="/products">
              {t("cart.browseProducts", lang)}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <header className="sticky top-0 z-20 border-b bg-white">
        <div className="container relative mx-auto flex min-h-16 max-w-5xl items-center justify-between px-4">
          <Link
            href="/products"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 text-slate-700 transition-colors hover:bg-gray-100"
            aria-label={t("checkout.backToShop", lang)}
          >
            <ArrowLeft
              aria-hidden="true"
              className={cn("h-5 w-5", isRtl && "rotate-180")}
              strokeWidth={2.25}
            />
          </Link>
          <Link
            href="/"
            aria-label="UpDerma home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
          >
            <Image
              src="/brand/upderma-wordmark-tm-header.png"
              alt="UpDerma"
              width={307}
              height={44}
              priority
              sizes="(max-width: 639px) 142px, 158px"
              className="h-auto w-[142px] brightness-0 opacity-80 sm:w-[158px]"
            />
          </Link>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700",
              isRtl && "flex-row-reverse",
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            <span className={cn(isRtl && "font-urdu-tight")}>
              {t("common.secure", lang)}
            </span>
          </div>
        </div>
      </header>

      <div className="border-b bg-[#fbfaf8] py-2">
        <div
          className={cn(
            "container mx-auto flex max-w-5xl items-center justify-center gap-2 px-4 text-center text-xs font-medium text-gray-600",
            isRtl && "flex-row-reverse",
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span>{t("checkout.trustStrip.guarantee", lang)}</span>
          <span aria-hidden="true" className="text-gray-300">
            •
          </span>
          <span>{t("checkout.trustStrip.delivery", lang)}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-lg px-4 py-4">
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3",
            isRtl && "flex-row-reverse",
          )}
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <p
            className={cn(
              "text-xs font-medium text-amber-800",
              isRtl &&
                "flex-1 text-right font-urdu-ui",
            )}
          >
            {t("checkout.urgencyText", lang)}
          </p>
        </div>

        {error && (
          <div
            className={cn(
              "mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700",
              isRtl && "flex-row-reverse",
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span
              className={cn(isRtl && "text-right font-urdu")}
            >
              {error}
            </span>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmitOrder();
          }}
        >
          <section className="mb-3 rounded-xl border bg-white p-4">
            <SectionHeading isRtl={isRtl}>
              {t("checkout.summary.title", lang)}
            </SectionHeading>
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  className={cn(
                    "flex items-center gap-3",
                    isRtl && "flex-row-reverse",
                  )}
                  key={`${item.productSlug}-${item.packageType}`}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "min-w-0 flex-1",
                      isRtl && "text-right",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isRtl && "font-urdu",
                      )}
                    >
                      {(isRtl && item.productNameUr) ||
                        item.productName}
                      {item.isPreorder && (
                        <span className="ml-1.5 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          {t("common.preOrder", lang)}
                        </span>
                      )}
                    </p>
                    {item.isPreorder &&
                      (item.preorderNote ||
                        item.preorderNoteUr) && (
                        <p
                          className={cn(
                            "mt-0.5 text-[10px] text-amber-600",
                            isRtl && "font-urdu-tight",
                          )}
                        >
                          {(isRtl && item.preorderNoteUr) ||
                            item.preorderNote}
                        </p>
                      )}
                    <div
                      className={cn(
                        "mt-0.5 flex items-center gap-1.5",
                        isRtl &&
                          "flex-row-reverse justify-end",
                      )}
                    >
                      {(item.packageName !== item.productName ||
                        item.bottles > 1) && (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          <Package className="h-3 w-3" />
                          {(isRtl && item.packageNameUr) ||
                            item.packageName}
                        </span>
                      )}
                      {item.bottles > 1 && (
                        <span className="text-xs text-gray-400">
                          {item.bottles}{" "}
                          {(
                            item.bottles > 1
                              ? t("common.bottles", lang)
                              : t("common.bottle", lang)
                          ).toLowerCase()}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold">
                    PKR{" "}
                    {(
                      item.unitPrice * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              {coupon ? (
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      {coupon.code}
                    </span>
                    <span className="text-xs text-emerald-600">
                      (-PKR {coupon.discount.toLocaleString()})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponError("");
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-red-600"
                    aria-label={
                      isRtl ? "کوپن ہٹائیں" : "Remove coupon"
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : showCoupon ? (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(
                          event.target.value.toUpperCase(),
                        );
                        setCouponError("");
                      }}
                      placeholder={t("checkout.enterCode", lang)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm uppercase outline-none"
                      dir="ltr"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleApplyCoupon()}
                      disabled={
                        validatingCoupon || !couponInput.trim()
                      }
                      className="px-3"
                    >
                      {validatingCoupon ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        t("checkout.apply", lang)
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">
                      {couponError}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className={cn(
                    "flex items-center gap-1 text-xs text-primary hover:underline",
                    isRtl &&
                      "flex-row-reverse font-urdu-tight",
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {t("checkout.haveDiscountCode", lang)}
                </button>
              )}
            </div>
          </section>

          <section className="mb-3 rounded-xl border bg-white p-4">
            <SectionHeading isRtl={isRtl}>
              {t("checkout.deliveryDetails", lang)}
            </SectionHeading>
            <div className="space-y-3">
              <div
                className="absolute h-0 w-0 overflow-hidden opacity-0"
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(event) =>
                    setWebsite(event.target.value)
                  }
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t("checkout.form.fullName", lang)} required isRtl={isRtl}>
                  <ValidatedInput
                    field="customerName"
                    type="text"
                    value={form.customerName}
                    placeholder={t(
                      "checkout.form.fullNamePlaceholder",
                      lang,
                    )}
                    className={cn(
                      inputClass,
                      fieldBorderCls("customerName"),
                      isRtl && "text-right font-urdu",
                    )}
                    autoComplete="name"
                    isRtl={isRtl}
                    valid={fieldValid("customerName")}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  />
                </Field>
                <Field label={t("checkout.form.phone", lang)} required isRtl={isRtl}>
                  <ValidatedInput
                    field="customerPhone"
                    type="tel"
                    value={form.customerPhone}
                    placeholder={t(
                      "checkout.form.phonePlaceholder",
                      lang,
                    )}
                    className={cn(
                      inputClass,
                      fieldBorderCls("customerPhone"),
                    )}
                    dir="ltr"
                    autoComplete="tel"
                    isRtl={isRtl}
                    valid={fieldValid("customerPhone")}
                    onChange={handleInputChange}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  />
                </Field>
              </div>

              <Field label={t("checkout.form.city", lang)} required isRtl={isRtl}>
                <div className="relative">
                  <select
                    value={form.city}
                    onChange={(event) => {
                      handleInputChange(
                        "city",
                        event.target.value,
                      );
                      setTouched((current) => ({
                        ...current,
                        city: true,
                      }));
                    }}
                    onFocus={() => handleFieldFocus("city")}
                    className={cn(
                      inputClass,
                      fieldBorderCls("city"),
                      "appearance-none bg-white",
                      isRtl
                        ? "pl-8 pr-3 text-right font-urdu"
                        : "pr-8",
                      !form.city && "text-gray-400",
                    )}
                  >
                    <option value="">
                      {t("checkout.form.cityPlaceholder", lang)}
                    </option>
                    {PAKISTAN_CITIES.map((city) => (
                      <option value={city} key={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={cn(
                      "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400",
                      isRtl ? "left-3" : "right-3",
                    )}
                  />
                </div>
              </Field>

              <Field label={t("checkout.form.address", lang)} required isRtl={isRtl}>
                <div className="relative">
                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      handleInputChange(
                        "address",
                        event.target.value,
                      )
                    }
                    onFocus={() =>
                      handleFieldFocus("address")
                    }
                    onBlur={() => handleFieldBlur("address")}
                    placeholder={t(
                      "checkout.form.addressPlaceholder",
                      lang,
                    )}
                    rows={2}
                    className={cn(
                      inputClass,
                      fieldBorderCls("address"),
                      "resize-none",
                      isRtl && "text-right font-urdu",
                    )}
                    autoComplete="street-address"
                  />
                  {fieldValid("address") === true && (
                    <Check
                      className={cn(
                        "absolute top-3 h-4 w-4 text-emerald-500",
                        isRtl ? "left-3" : "right-3",
                      )}
                    />
                  )}
                </div>
              </Field>

              {showEmail ? (
                <Field
                  label={t("checkout.form.email", lang)}
                  optional={t("checkout.form.optional", lang)}
                  isRtl={isRtl}
                >
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) =>
                      handleInputChange(
                        "customerEmail",
                        event.target.value,
                      )
                    }
                    onFocus={() =>
                      handleFieldFocus("customerEmail")
                    }
                    onBlur={() =>
                      handleFieldBlur("customerEmail")
                    }
                    placeholder={t(
                      "checkout.form.emailPlaceholder",
                      lang,
                    )}
                    className={cn(
                      inputClass,
                      fieldBorderCls("customerEmail"),
                    )}
                    dir="ltr"
                    autoComplete="email"
                  />
                </Field>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmail(true)}
                  className={cn(
                    "flex items-center gap-1 text-xs text-primary hover:underline",
                    isRtl &&
                      "flex-row-reverse font-urdu-tight",
                  )}
                >
                  <Mail className="h-3 w-3" />
                  {t("checkout.form.addEmail", lang)}
                </button>
              )}
            </div>
          </section>

          <fieldset className="mb-3 rounded-xl border bg-white p-4">
            <legend
              className={cn(
                "mb-3 w-full text-sm font-semibold uppercase tracking-wide text-gray-500",
                isRtl &&
                  "text-right font-urdu-ui text-[15px] normal-case tracking-normal",
              )}
            >
              {t("checkout.payment", lang)}
            </legend>
            <div className="flex flex-col gap-2">
              {codMethod && (
                <PaymentMethodCard
                  method={codMethod}
                  selected={isCod}
                  isRtl={isRtl}
                  badge={t("checkout.codPrimaryBadge", lang)}
                  fee={
                    !freeShipping && codMethod.deliveryFee > 0
                      ? codMethod.deliveryFee
                      : undefined
                  }
                  orderClass="order-1"
                  onSelect={() => {
                    handleInputChange(
                      "paymentMethod",
                      codMethod.id,
                    );
                    setCodConfirmed(true);
                    analytics.addPaymentInfo(codMethod.id, total);
                  }}
                >
                  <p
                    className={cn(
                      "mt-1 text-xs text-gray-500",
                      isRtl && "font-urdu",
                    )}
                  >
                    {t("checkout.codReassuranceText", lang)}
                  </p>
                </PaymentMethodCard>
              )}
              {prepaidMethods.map((method, index) => (
                <PaymentMethodCard
                  method={method}
                  selected={form.paymentMethod === method.id}
                  isRtl={isRtl}
                  badge={
                    index === 0
                      ? t("checkout.prepaidRecommended", lang)
                      : undefined
                  }
                  fee={
                    method.deliveryFee > 0
                      ? method.deliveryFee
                      : undefined
                  }
                  freeFee={method.deliveryFee === 0}
                  discountPercent={
                    config.prepaidDiscountPercent > 0
                      ? config.prepaidDiscountPercent
                      : undefined
                  }
                  orderClass="order-2"
                  onSelect={() => {
                    handleInputChange(
                      "paymentMethod",
                      method.id,
                    );
                    analytics.addPaymentInfo(method.id, total);
                  }}
                  key={method.id}
                />
              ))}
            </div>

            {prepaidMethods.length > 0 && (
              <div
                className={cn(
                  "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("checkout.prepaidPriorityNotice", lang)}
              </div>
            )}
            {requiresVerification && (
              <div
                className={cn(
                  "mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("checkout.prepaidInstructionNotice", lang)}
              </div>
            )}
            {isCod && (
              <div className="mt-3 border-t pt-3">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={codConfirmed}
                    onChange={(event) =>
                      setCodConfirmed(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <span
                    className={cn(
                      "text-xs leading-relaxed text-gray-600",
                      isRtl && "text-right font-urdu",
                    )}
                  >
                    {t("checkout.codVerificationText", lang)}
                  </span>
                </label>
              </div>
            )}
          </fieldset>

          <section className="mb-3 rounded-xl border bg-white p-4">
            <div className="space-y-1.5 text-sm">
              <SummaryRow
                isRtl={isRtl}
                label={t("checkout.summary.subtotal", lang)}
                value={`PKR ${subtotal.toLocaleString()}`}
              />
              <SummaryRow
                isRtl={isRtl}
                label={t("checkout.summary.delivery", lang)}
                value={
                  deliveryFee === 0
                    ? t("checkout.summary.free", lang)
                    : `PKR ${deliveryFee.toLocaleString()}`
                }
                valueClass={
                  deliveryFee === 0
                    ? "font-medium text-emerald-600"
                    : undefined
                }
              />
              {prepaidDiscount > 0 && (
                <SummaryRow
                  isRtl={isRtl}
                  className="text-blue-600"
                  label={
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <Percent className="h-3 w-3" />
                      {interpolate(
                        t(
                          "checkout.prepaidDiscountText",
                          lang,
                        ) || "",
                        {
                          percent:
                            config.prepaidDiscountPercent.toString(),
                        },
                      )}
                    </span>
                  }
                  value={`-PKR ${prepaidDiscount.toLocaleString()}`}
                  valueClass="font-medium"
                />
              )}
              {couponDiscount > 0 && (
                <SummaryRow
                  isRtl={isRtl}
                  className="text-emerald-600"
                  label={t("cart.discount", lang)}
                  value={`-PKR ${couponDiscount.toLocaleString()}`}
                  valueClass="font-medium"
                />
              )}
              {savings > 0 && (
                <SummaryRow
                  isRtl={isRtl}
                  className="text-emerald-600"
                  label={t("cart.youSave", lang)}
                  value={`-PKR ${savings.toLocaleString()}`}
                  valueClass="font-medium"
                />
              )}
              <SummaryRow
                isRtl={isRtl}
                className="border-t pt-2 text-lg font-bold"
                label={t("checkout.summary.total", lang)}
                value={`PKR ${total.toLocaleString()}`}
                valueClass="text-primary"
              />
            </div>

            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="mt-4 w-full py-4 text-base"
              disabled={submitting || (isCod && !codConfirmed)}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />{" "}
                  {t("checkout.placingOrder", lang)}
                </>
              ) : (
                <span className={cn(isRtl && "font-urdu")}>
                  {isCod
                    ? `${t(
                        "checkout.confirmOrder",
                        lang,
                      )} — PKR ${total.toLocaleString()}`
                    : `${t(
                        "checkout.payNow",
                        lang,
                      )} — PKR ${total.toLocaleString()}`}
                </span>
              )}
            </Button>

            {isCod && (
              <div
                className={cn(
                  "mt-3 flex items-center justify-center gap-2 text-xs text-gray-500",
                  isRtl && "flex-row-reverse",
                )}
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                <span
                  className={cn(isRtl && "font-urdu-ui")}
                >
                  {t("checkout.whatsappNotice", lang)}
                </span>
              </div>
            )}
          </section>
        </form>
      </div>

      <footer className="border-t py-6 text-center text-xs text-gray-500">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          aria-label={t("checkout.policyLinksLabel", lang)}
        >
          <Link
            href="/refund"
            className="underline-offset-4 hover:underline"
          >
            {t("checkout.refundPolicy", lang)}
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-4 hover:underline"
          >
            {t("checkout.privacyPolicy", lang)}
          </Link>
          <Link
            href="/terms"
            className="underline-offset-4 hover:underline"
          >
            {t("checkout.termsPolicy", lang)}
          </Link>
          <Link
            href="/delivery-returns"
            className="underline-offset-4 hover:underline"
          >
            {t("checkout.deliveryReturnsPolicy", lang)}
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function SectionHeading({
  children,
  isRtl,
}: {
  children: React.ReactNode;
  isRtl: boolean;
}) {
  return (
    <h2
      className={cn(
        "mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500",
        isRtl &&
          "text-right font-urdu-ui text-[15px] normal-case tracking-normal",
      )}
    >
      {children}
    </h2>
  );
}

function Field({
  children,
  label,
  required = false,
  optional,
  isRtl,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  optional?: string;
  isRtl: boolean;
}) {
  return (
    <div>
      <label
        className={cn(
          "mb-1 block text-xs font-medium text-gray-600",
          isRtl && "text-right font-urdu",
        )}
      >
        {label}
        {required && " *"}
        {optional && (
          <span
            className={cn(
              "font-normal text-gray-400",
              isRtl ? "mr-1" : "ml-1",
            )}
          >
            ({optional})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function ValidatedInput({
  field,
  isRtl,
  valid,
  onChange,
  onFocus,
  onBlur,
  ...props
}: Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onFocus" | "onBlur"
> & {
  field: keyof CheckoutFormState;
  isRtl: boolean;
  valid: boolean | null;
  onChange: (
    field: keyof CheckoutFormState,
    value: string,
  ) => void;
  onFocus: (field: keyof CheckoutFormState) => void;
  onBlur: (field: keyof CheckoutFormState) => void;
}) {
  return (
    <div className="relative">
      <input
        {...props}
        onChange={(event) => onChange(field, event.target.value)}
        onFocus={() => onFocus(field)}
        onBlur={() => onBlur(field)}
      />
      {valid === true && (
        <Check
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500",
            isRtl ? "left-3" : "right-3",
          )}
        />
      )}
    </div>
  );
}

function PaymentMethodCard({
  method,
  selected,
  isRtl,
  badge,
  fee,
  freeFee = false,
  discountPercent,
  orderClass,
  onSelect,
  children,
}: {
  method: CheckoutConfig["paymentMethods"][string];
  selected: boolean;
  isRtl: boolean;
  badge?: string;
  fee?: number;
  freeFee?: boolean;
  discountPercent?: number;
  orderClass: string;
  onSelect: () => void;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        orderClass,
        "flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300",
        isRtl && "flex-row-reverse text-right",
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={method.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
          selected
            ? "border-primary bg-primary"
            : "border-gray-300",
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </span>
      <div className="flex-1">
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            isRtl && "flex-row-reverse",
          )}
        >
          <span
            className={cn(
              "text-sm font-semibold",
              isRtl && "font-urdu",
            )}
          >
            {isRtl ? method.nameUr : method.name}
          </span>
          {badge && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-medium",
                method.id === "cod"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-emerald-100 font-semibold text-emerald-800",
              )}
            >
              {badge}
            </span>
          )}
          {freeFee ? (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
              {t(
                "checkout.freeDeliveryText",
                isRtl ? "ur" : "en",
              )}
            </span>
          ) : fee ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
              +PKR {fee}
            </span>
          ) : null}
          {discountPercent ? (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
              {discountPercent}%{" "}
              {t(
                "checkout.offText",
                isRtl ? "ur" : "en",
              )}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-0.5 text-xs text-gray-500",
            isRtl && "font-urdu",
          )}
        >
          {isRtl ? method.descriptionUr : method.description}
        </p>
        {children}
      </div>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  isRtl,
  className,
  valueClass,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  isRtl: boolean;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between",
        isRtl && "flex-row-reverse",
        className,
      )}
    >
      <span className={cn(!className?.includes("font-bold") && "text-gray-500")}>
        {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
