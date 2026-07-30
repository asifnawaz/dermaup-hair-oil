"use client";

import {
  ArrowRight,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { CheckoutShippingConfig } from "@/lib/checkout-config";
import type { Language } from "@/lib/constants";
import { interpolate, t } from "@/lib/i18n";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  lang?: Language;
  shippingConfig: CheckoutShippingConfig;
}

export function CartDrawer({
  open,
  onClose,
  lang = "en",
  shippingConfig,
}: CartDrawerProps) {
  const {
    items,
    itemCount,
    subtotal,
    savings,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const isRtl = lang === "ur";
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!open) setCheckingOut(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  const hasItems = items.length > 0;
  const freeShippingThreshold = Math.max(
    0,
    shippingConfig.freeShippingThreshold,
  );
  const progressThreshold = Math.max(1, freeShippingThreshold);
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryFee = hasFreeShipping ? 0 : shippingConfig.codDeliveryFee;
  const total = subtotal + deliveryFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    setCheckingOut(true);
    onClose();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-label={isRtl ? "کارٹ بند کریں" : "Close cart"}
      />
      <div
        className={cn(
          "fixed top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl",
          isRtl ? "left-0" : "right-0",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b p-4",
            isRtl && "flex-row-reverse",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isRtl && "flex-row-reverse",
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            <h2 className={cn("text-lg font-bold", isRtl && "font-urdu")}>
              {t("cart.yourOrder", lang)}
            </h2>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            aria-label={isRtl ? "کارٹ بند کریں" : "Close cart"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasItems && !hasFreeShipping && (
          <div className="border-b bg-emerald-50/50 px-4 py-3">
            <p
              className={cn(
                "mb-1.5 text-sm text-gray-600",
                isRtl && "text-right font-urdu",
              )}
            >
              {interpolate(t("cart.freeShippingAddMore", lang), {
                amount: amountToFreeShipping.toLocaleString(),
              })}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (subtotal / progressThreshold) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
        {hasItems && hasFreeShipping && (
          <div className="border-b bg-emerald-50 px-4 py-2">
            <p
              className={cn(
                "text-center text-sm font-medium text-emerald-700",
                isRtl && "font-urdu",
              )}
            >
              {t("cart.freeShippingUnlocked", lang)}
            </p>
          </div>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {hasItems ? (
            items.map((item) => (
              <div
                key={`${item.productSlug}-${item.packageType}`}
                className={cn(
                  "flex gap-3 rounded-lg border bg-gray-50 p-3",
                  isRtl && "flex-row-reverse",
                )}
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
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
                      "truncate text-sm font-medium",
                      isRtl && "font-urdu",
                    )}
                  >
                    {(isRtl && item.productNameUr) || item.productName}
                  </p>
                  {item.isPreorder && (
                    <div
                      className={cn(
                        "mt-0.5 flex items-center gap-1",
                        isRtl && "flex-row-reverse justify-end",
                      )}
                    >
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                        {t("common.preOrder", lang)}
                      </span>
                    </div>
                  )}
                  {(item.packageName !== item.productName ||
                    item.bottles > 1) && (
                    <div
                      className={cn(
                        "mt-0.5 flex items-center gap-1.5",
                        isRtl && "flex-row-reverse justify-end",
                      )}
                    >
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
                        <Package className="h-3 w-3" />
                        {(isRtl && item.packageNameUr) || item.packageName}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "mt-2 flex items-center justify-between",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-md border bg-white",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productSlug,
                            item.packageType,
                            item.quantity - 1,
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center hover:bg-gray-100"
                        aria-label={
                          isRtl
                            ? `${item.productNameUr || item.productName} کی مقدار کم کریں`
                            : `Decrease ${item.productName} quantity`
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productSlug,
                            item.packageType,
                            item.quantity + 1,
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center hover:bg-gray-100"
                        aria-label={
                          isRtl
                            ? `${item.productNameUr || item.productName} کی مقدار بڑھائیں`
                            : `Increase ${item.productName} quantity`
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <span className="text-sm font-semibold">
                        PKR {(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() =>
                          removeFromCart(item.productSlug, item.packageType)
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={
                          isRtl
                            ? `${item.productNameUr || item.productName} کارٹ سے ہٹائیں`
                            : `Remove ${item.productName} from cart`
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-lg font-semibold",
                    isRtl && "font-urdu",
                  )}
                >
                  {t("cart.empty", lang)}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm text-gray-500",
                    isRtl && "font-urdu",
                  )}
                >
                  {isRtl
                    ? "مصنوعات شامل کرنے کے لیے شاپ پر جائیں"
                    : "Browse our products to get started"}
                </p>
              </div>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-700 px-5 text-sm font-bold text-white"
              >
                {t("cart.browseProducts", lang)}
              </Link>
            </div>
          )}
        </div>

        {hasItems && (
          <div className="space-y-3 border-t bg-white p-4">
            {savings > 0 && (
              <div className="rounded-md bg-emerald-50 py-1.5 text-center text-sm font-medium text-emerald-700">
                {interpolate(t("cart.saving", lang), {
                  amount: savings.toLocaleString(),
                })}
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <div
                className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse",
                )}
              >
                <span className="text-gray-500">{t("cart.subtotal", lang)}</span>
                <span className="font-medium">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
              <div
                className={cn(
                  "flex justify-between",
                  isRtl && "flex-row-reverse",
                )}
              >
                <span className="text-gray-500">{t("cart.delivery", lang)}</span>
                <span
                  className={cn(
                    "font-medium",
                    hasFreeShipping && "text-emerald-600",
                  )}
                >
                  {hasFreeShipping
                    ? t("cart.free", lang)
                    : `PKR ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              {!hasFreeShipping && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs text-emerald-600",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <Truck className="h-3 w-3" />
                  <span className={cn(isRtl && "font-urdu")}>
                    {t("cart.prepaidPromo", lang)}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "flex justify-between border-t pt-1.5 font-bold",
                  isRtl && "flex-row-reverse",
                )}
              >
                <span>{t("cart.total", lang)}</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="flex min-h-14 w-full items-center justify-center rounded-lg bg-emerald-700 px-5 text-lg font-bold text-white disabled:opacity-60"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-2",
                  isRtl && "flex-row-reverse",
                )}
              >
                {checkingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight
                    className={cn("h-5 w-5", isRtl && "rotate-180")}
                  />
                )}
                <span className={cn(isRtl && "font-urdu")}>
                  {checkingOut
                    ? t("common.loading", lang)
                    : t("cart.continueToCheckout", lang)}
                </span>
              </span>
            </button>
            <button
              onClick={onClose}
              className={cn(
                "w-full text-center text-sm text-gray-500 transition-colors hover:text-gray-900",
                isRtl && "font-urdu",
              )}
            >
              {t("cart.continueShopping", lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
