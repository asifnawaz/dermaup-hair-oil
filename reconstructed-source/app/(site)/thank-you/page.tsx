import { eq } from "drizzle-orm";

import { getD1, getDb } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { getLanguage } from "@/lib/language";
import { getCurrentStorefrontSettings } from "@/lib/store-settings.server";
import { getStoreWhatsAppLinks } from "@/lib/store-settings";

import {
  ThankYouClient,
  type ThankYouOrderSummary,
} from "./thank-you-client";

type ThankYouPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

async function getOrderSummary(
  orderNumber: string,
): Promise<ThankYouOrderSummary | null> {
  if (!orderNumber || orderNumber === "N/A") return null;

  const d1 = getD1();
  if (!d1) return null;

  const db = getDb(d1);
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .get();

  if (!order) return null;

  const items = await db
    .select({
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      subtotal: orderItems.subtotal,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .all();
  const couponDiscount = order.couponDiscount || 0;
  const prepaidDiscount = Math.max(
    0,
    order.subtotal + order.deliveryFee - couponDiscount - order.total,
  );

  return {
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || "pending",
    orderStatus: order.orderStatus || "pending",
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    couponDiscount,
    prepaidDiscount,
    total: order.total,
    hasPaymentProof: Boolean(order.paymentScreenshotUrl),
    items,
  };
}

export default async function ThankYouPage({
  searchParams,
}: ThankYouPageProps) {
  const fallbackOrderId = (await searchParams).orderId || "N/A";
  const [lang, storeSettings, order] = await Promise.all([
    getLanguage(),
    getCurrentStorefrontSettings(),
    getOrderSummary(fallbackOrderId),
  ]);
  const links = getStoreWhatsAppLinks(storeSettings.contact);
  const paymentVerificationUrl = order
    ? links.paymentVerification(order.orderNumber, order.total)
    : links.general;

  return (
    <ThankYouClient
      lang={lang}
      fallbackOrderId={fallbackOrderId}
      whatsappDisplay={storeSettings.contact.whatsappDisplay}
      whatsappUrl={links.general}
      paymentVerificationUrl={paymentVerificationUrl}
      order={order}
      paymentMethods={storeSettings.checkoutConfig.paymentMethods}
      paymentDetails={storeSettings.paymentDetails}
    />
  );
}
