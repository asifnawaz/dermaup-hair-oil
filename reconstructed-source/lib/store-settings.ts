/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the storefront settings module in the latest deployed
 * Cloudflare Worker and cross-checked against the surviving source index.
 */

import {
  getDefaultCheckoutConfig,
  normalizeCheckoutConfig,
  type CheckoutConfig,
} from './checkout-config';

export type StoreContactSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  businessName: string;
  showFloatingButton: boolean;
};

export type StorePromoBannerSettings = {
  textEn: string;
  textUr: string;
};

export type StorePaymentDetails = Record<string, Record<string, string>>;

export type StorefrontSettings = {
  contact: StoreContactSettings;
  promoBanner: StorePromoBannerSettings;
  checkoutConfig: CheckoutConfig;
  paymentDetails: StorePaymentDetails;
};

export const DEFAULT_CONTACT_SETTINGS: StoreContactSettings = {
  whatsappNumber: '923001234567',
  whatsappDisplay: '0300-1234567',
  email: 'support@upderma.com',
  businessName: 'UpDerma Pvt Ltd',
  showFloatingButton: true,
};

export const DEFAULT_PROMO_BANNER_SETTINGS: StorePromoBannerSettings = {
  textEn: '',
  textUr: '',
};

export function toTrimmedString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export function toWhatsAppNumber(
  value: unknown,
  fallback: string,
): string {
  return (
    toTrimmedString(value, fallback)
      .replace(/\s+/g, '')
      .replace(/^\+/, '') || fallback
  );
}

export function normalizeContactSettings(raw: unknown): StoreContactSettings {
  const parsed =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};

  return {
    whatsappNumber: toWhatsAppNumber(
      parsed.whatsappNumber,
      DEFAULT_CONTACT_SETTINGS.whatsappNumber,
    ),
    whatsappDisplay: toTrimmedString(
      parsed.whatsappDisplay,
      DEFAULT_CONTACT_SETTINGS.whatsappDisplay,
    ),
    email: toTrimmedString(
      parsed.email,
      DEFAULT_CONTACT_SETTINGS.email,
    ),
    businessName: toTrimmedString(
      parsed.businessName,
      DEFAULT_CONTACT_SETTINGS.businessName,
    ),
    showFloatingButton:
      typeof parsed.showFloatingButton === 'boolean'
        ? parsed.showFloatingButton
        : DEFAULT_CONTACT_SETTINGS.showFloatingButton,
  };
}

export function normalizePromoBannerSettings(
  raw: unknown,
): StorePromoBannerSettings {
  const parsed =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>)
      : {};

  return {
    textEn:
      typeof parsed.textEn === 'string'
        ? parsed.textEn.trim()
        : DEFAULT_PROMO_BANNER_SETTINGS.textEn,
    textUr:
      typeof parsed.textUr === 'string'
        ? parsed.textUr.trim()
        : DEFAULT_PROMO_BANNER_SETTINGS.textUr,
  };
}

export function normalizePaymentDetails(raw: unknown): StorePaymentDetails {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const result: StorePaymentDetails = {};

  for (const [methodKey, methodValue] of Object.entries(raw)) {
    if (!methodValue || typeof methodValue !== 'object') {
      continue;
    }

    const fields = Object.fromEntries(
      Object.entries(methodValue).filter(
        ([, value]) =>
          typeof value === 'string' && value.trim().length > 0,
      ),
    ) as Record<string, string>;

    if (Object.keys(fields).length > 0) {
      result[methodKey] = fields;
    }
  }

  return result;
}

export function normalizeStorefrontSettings(
  rawSettings: Record<string, unknown> | undefined = {},
): StorefrontSettings {
  return {
    contact: normalizeContactSettings(rawSettings.contact),
    promoBanner: normalizePromoBannerSettings(rawSettings.promo_banner),
    checkoutConfig: normalizeCheckoutConfig(
      rawSettings.checkout_config,
      rawSettings.payment_methods,
    ),
    paymentDetails: normalizePaymentDetails(rawSettings.payment_details),
  };
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  text?: string,
): string {
  const base = `https://wa.me/${whatsappNumber.replace(/^\+/, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function getStoreWhatsAppLinks(
  contact: Pick<StoreContactSettings, 'whatsappNumber'>,
): {
  general: string;
  orderSupport: (orderId: string) => string;
  paymentVerification: (orderId: string, amount: number) => string;
} {
  return {
    general: buildWhatsAppUrl(contact.whatsappNumber),
    orderSupport: (orderId: string) =>
      buildWhatsAppUrl(
        contact.whatsappNumber,
        `Hi! I have a question about my order ${orderId}`,
      ),
    paymentVerification: (orderId: string, amount: number) =>
      buildWhatsAppUrl(
        contact.whatsappNumber,
        `Order ID: ${orderId}\nAmount: PKR ${amount}\n\n[Please attach payment screenshot]`,
      ),
  };
}

export function getPromoBannerText(
  promoBanner: StorePromoBannerSettings,
  lang: 'en' | 'ur',
  freeShippingThreshold: number,
): string {
  const configured =
    lang === 'ur' ? promoBanner.textUr : promoBanner.textEn;

  return (
    configured ||
    (lang === 'ur'
      ? `PKR ${freeShippingThreshold.toLocaleString()}+ سے آرڈرز پر مفت ڈیلیوری`
      : `Free delivery on orders above PKR ${freeShippingThreshold.toLocaleString()}`)
  );
}

export function getPaymentMethodDisplayNames(
  checkoutConfig: CheckoutConfig,
  lang: 'en' | 'ur',
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const method of Object.values(checkoutConfig.paymentMethods)) {
    const name = (lang === 'ur' ? method.nameUr : method.name).trim();

    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

export function getDefaultStorefrontSettings(): StorefrontSettings {
  return {
    contact: { ...DEFAULT_CONTACT_SETTINGS },
    promoBanner: { ...DEFAULT_PROMO_BANNER_SETTINGS },
    checkoutConfig: getDefaultCheckoutConfig(),
    paymentDetails: {},
  };
}
