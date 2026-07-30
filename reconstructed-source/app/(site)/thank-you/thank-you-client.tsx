"use client";

import {
  CircleCheckBig,
  ClipboardCheck,
  CloudUpload,
  CreditCard,
  LoaderCircle,
  MessageCircle,
  Package,
  TriangleAlert,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CheckoutPaymentMethod } from "@/lib/checkout-config";
import type { Language } from "@/lib/constants";
import { interpolate, t } from "@/lib/i18n";
import { cn, formatPrice } from "@/lib/utils";
import { analytics } from "@/lib/zaraz";

export type ThankYouPaymentMethodSummary = Pick<
  CheckoutPaymentMethod,
  "id" | "name" | "nameUr" | "requiresVerification"
>;

export type ThankYouOrderSummary = {
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  prepaidDiscount: number;
  total: number;
  hasPaymentProof: boolean;
  items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
  }>;
};

interface ThankYouClientProps {
  lang: Language;
  fallbackOrderId: string;
  whatsappDisplay: string;
  whatsappUrl: string;
  paymentVerificationUrl: string;
  order: ThankYouOrderSummary | null;
  paymentMethods: Record<string, ThankYouPaymentMethodSummary>;
  paymentDetails: Record<string, Record<string, string>>;
}

type PaymentProofUploadResponse = {
  success: boolean;
  error?: string;
};

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function ThankYouClient({
  lang,
  fallbackOrderId,
  whatsappDisplay,
  whatsappUrl,
  paymentVerificationUrl,
  order,
  paymentMethods,
  paymentDetails,
}: ThankYouClientProps) {
  const isRtl = lang === "ur";
  const orderId = order?.orderNumber || fallbackOrderId || "N/A";
  const method = order ? paymentMethods[order.paymentMethod] : null;
  const paymentMethodLabel = method
    ? isRtl
      ? method.nameUr
      : method.name
    : order?.paymentMethod.toUpperCase() || "—";
  const isPrepaid =
    Boolean(order) &&
    order?.paymentMethod !== "cod" &&
    method?.requiresVerification !== false;
  const details = order
    ? paymentDetails[order.paymentMethod]
    : undefined;
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUploaded, setProofUploaded] = useState(
    order?.hasPaymentProof || false,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setProofUploaded(order?.hasPaymentProof || false);
  }, [order?.hasPaymentProof]);

  const whatNextItems = useMemo(() => {
    const key = isPrepaid
      ? "thankYou.whatNext.prepaidItems"
      : "thankYou.whatNext.codItems";
    const methodItems = asStringList(t(key, lang));
    return methodItems.length > 0
      ? methodItems
      : asStringList(t("thankYou.whatNext.items", lang));
  }, [isPrepaid, lang]);
  const title = isPrepaid
    ? t("thankYou.prepaidTitle", lang)
    : t("thankYou.codTitle", lang);
  const greeting = interpolate(
    isPrepaid
      ? t("thankYou.prepaidGreeting", lang)
      : t("thankYou.codGreeting", lang),
    { orderId },
  );

  async function uploadProof() {
    if (!proofFile || !order) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", proofFile);
      const response = await fetch(
        `/api/orders/${encodeURIComponent(order.orderNumber)}/payment-proof`,
        { method: "POST", body: formData },
      );
      const data =
        (await response.json()) as PaymentProofUploadResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || t("thankYou.proofUpload.error", lang),
        );
      }

      setProofUploaded(true);
      setProofFile(null);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : t("thankYou.proofUpload.error", lang),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-primary/5 to-background py-8 md:py-12",
        isRtl && "rtl",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {isPrepaid ? (
                <ClipboardCheck className="h-10 w-10 text-primary" />
              ) : (
                <CircleCheckBig className="h-10 w-10 text-primary" />
              )}
            </div>
            <p
              className={cn(
                "mb-1 text-sm text-muted-foreground",
                isRtl && "font-urdu",
              )}
            >
              {t("thankYou.orderId", lang)}:{" "}
              <span className="font-semibold text-foreground">
                {orderId}
              </span>
            </p>
            <h1
              className={cn(
                "mb-2 text-3xl font-bold text-primary md:text-4xl",
                isRtl && "font-urdu",
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                "text-base text-muted-foreground md:text-lg",
                isRtl && "font-urdu",
              )}
            >
              {greeting}
            </p>
          </div>

          {!order && (
            <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <TriangleAlert className="h-5 w-5 flex-shrink-0 text-amber-700" />
              <p
                className={cn(
                  "text-sm text-amber-900",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("thankYou.missingOrder", lang)}
              </p>
            </div>
          )}

          {order && (
            <div className="mb-6 rounded-xl border bg-background p-5 shadow-lg md:p-6">
              <h2
                className={cn(
                  "mb-4 flex items-center gap-2 text-lg font-bold",
                  isRtl && "flex-row-reverse text-right font-urdu",
                )}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                {t("thankYou.orderDetails.payment", lang)}
              </h2>
              <div className="space-y-3 text-sm">
                <div
                  className={cn(
                    "flex justify-between gap-4 border-b py-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="text-muted-foreground">
                    {t("thankYou.paymentInstructions.method", lang)}
                  </span>
                  <span
                    className={cn(
                      "text-right font-semibold",
                      isRtl && "text-left",
                    )}
                  >
                    {paymentMethodLabel}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-between gap-4 border-b py-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="text-muted-foreground">
                    {t("thankYou.orderDetails.total", lang)}
                  </span>
                  <span className="font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-between gap-4 py-2",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  <span className="text-muted-foreground">
                    {t("thankYou.paymentInstructions.status", lang)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      order.paymentStatus === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {order.paymentStatus === "verified"
                      ? t(
                          "thankYou.paymentInstructions.verified",
                          lang,
                        )
                      : isPrepaid
                        ? t(
                            "thankYou.paymentInstructions.pending",
                            lang,
                          )
                        : t(
                            "thankYou.paymentInstructions.cod",
                            lang,
                          )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {order && isPrepaid && (
            <div className="mb-6 rounded-xl border bg-background p-5 shadow-lg md:p-6">
              <h2
                className={cn(
                  "mb-2 text-lg font-bold",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("thankYou.paymentInstructions.title", lang)}
              </h2>
              <p
                className={cn(
                  "mb-4 text-sm text-muted-foreground",
                  isRtl && "text-right font-urdu",
                )}
              >
                {interpolate(
                  t("thankYou.paymentInstructions.body", lang),
                  { amount: formatPrice(order.total) },
                )}
              </p>

              {details ? (
                <div className="mb-4 divide-y rounded-xl border bg-muted/30">
                  {details.bankName && (
                    <PaymentDetail
                      isRtl={isRtl}
                      label={t(
                        "thankYou.paymentInstructions.bankName",
                        lang,
                      )}
                      value={details.bankName}
                    />
                  )}
                  {details.accountName && (
                    <PaymentDetail
                      isRtl={isRtl}
                      label={t(
                        "thankYou.paymentInstructions.accountTitle",
                        lang,
                      )}
                      value={details.accountName}
                    />
                  )}
                  {details.accountNumber && (
                    <PaymentDetail
                      isRtl={isRtl}
                      label={t(
                        "thankYou.paymentInstructions.accountNumber",
                        lang,
                      )}
                      value={details.accountNumber}
                      mono
                    />
                  )}
                  {details.iban && (
                    <PaymentDetail
                      isRtl={isRtl}
                      label="IBAN"
                      value={details.iban}
                      mono
                      breakAll
                    />
                  )}
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  {t("thankYou.paymentInstructions.noDetails", lang)}
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  analytics.whatsappClick(
                    "payment-verification-thank-you",
                  );
                  window.open(paymentVerificationUrl, "_blank");
                }}
              >
                <MessageCircle className="h-4 w-4" />
                {t(
                  "thankYou.paymentInstructions.whatsappButton",
                  lang,
                )}
              </Button>

              <div className="mt-4 rounded-xl border border-dashed p-4">
                <h3
                  className={cn(
                    "mb-1 text-sm font-semibold",
                    isRtl && "text-right font-urdu",
                  )}
                >
                  {t("thankYou.proofUpload.title", lang)}
                </h3>
                <p
                  className={cn(
                    "mb-3 text-xs text-muted-foreground",
                    isRtl && "text-right font-urdu",
                  )}
                >
                  {proofUploaded
                    ? t("thankYou.proofUpload.uploaded", lang)
                    : t("thankYou.proofUpload.help", lang)}
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={(event) => {
                    setProofFile(event.target.files?.[0] || null);
                    setUploadError("");
                  }}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary"
                />
                {uploadError && (
                  <p className="mt-2 text-xs text-red-600">
                    {uploadError}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  disabled={!proofFile || uploading}
                  onClick={uploadProof}
                >
                  {uploading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CloudUpload className="h-4 w-4" />
                  )}
                  {uploading
                    ? t("thankYou.proofUpload.uploading", lang)
                    : t("thankYou.proofUpload.button", lang)}
                </Button>
              </div>
            </div>
          )}

          {order && !isPrepaid && (
            <div className="mb-6 rounded-xl border bg-background p-5 shadow-lg md:p-6">
              <h2
                className={cn(
                  "mb-2 text-lg font-bold",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("thankYou.codSafety.title", lang)}
              </h2>
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  isRtl && "text-right font-urdu",
                )}
              >
                {interpolate(t("thankYou.codSafety.body", lang), {
                  amount: formatPrice(order.total),
                  phone: whatsappDisplay,
                })}
              </p>
            </div>
          )}

          <div className="mb-6 rounded-xl border bg-background p-5 shadow-lg md:p-6">
            <h2
              className={cn(
                "mb-4 text-lg font-bold",
                isRtl && "text-right font-urdu",
              )}
            >
              {t("thankYou.whatNext.title", lang)}
            </h2>
            <div className="space-y-4">
              {whatNextItems.map((item, index) => {
                const Icon =
                  index === 0
                    ? Package
                    : index === 1
                      ? MessageCircle
                      : Truck;
                return (
                  <div
                    className={cn(
                      "flex items-start gap-3",
                      isRtl && "flex-row-reverse",
                    )}
                    key={item}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p
                      className={cn(
                        "text-muted-foreground",
                        isRtl && "text-right font-urdu",
                      )}
                    >
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {order && order.items.length > 0 && (
            <div className="mb-6 rounded-xl border bg-background p-5 shadow-lg md:p-6">
              <h2
                className={cn(
                  "mb-4 text-lg font-bold",
                  isRtl && "text-right font-urdu",
                )}
              >
                {t("thankYou.orderDetails.title", lang)}
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    className={cn(
                      "flex justify-between gap-4 border-b py-2 text-sm",
                      isRtl && "flex-row-reverse",
                    )}
                    key={`${item.productName}-${item.quantity}`}
                  >
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
                {order.prepaidDiscount > 0 && (
                  <div
                    className={cn(
                      "flex justify-between gap-4 border-b py-2 text-sm text-emerald-700",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <span>
                      {t("checkout.prepaidDiscountLabel", lang)}
                    </span>
                    <span className="font-semibold">
                      -{formatPrice(order.prepaidDiscount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className={cn(isRtl && "font-urdu")}
            >
              <Link href="/products">
                {t("cart.continueShopping", lang)}
              </Link>
            </Button>
            <Button
              variant="default"
              className={cn(isRtl && "font-urdu")}
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              <MessageCircle className="h-4 w-4" />
              {t("footer.whatsapp", lang)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentDetail({
  label,
  value,
  isRtl,
  mono = false,
  breakAll = false,
}: {
  label: string;
  value: string;
  isRtl: boolean;
  mono?: boolean;
  breakAll?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3 p-3 text-sm",
        isRtl && "flex-row-reverse",
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-semibold",
          mono && "font-mono",
          breakAll && "break-all",
        )}
      >
        {value}
      </span>
    </div>
  );
}
