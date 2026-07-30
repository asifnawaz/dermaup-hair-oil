/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the checkout-config module embedded in the latest deployed
 * Cloudflare Worker and cross-checked against the surviving source index.
 * Runtime defaults and normalization behavior match the production bundle.
 */

export type CheckoutPaymentMethod = {
  id: string;
  name: string;
  nameUr: string;
  description: string;
  descriptionUr: string;
  deliveryFee: number;
  requiresVerification: boolean;
};

export type CheckoutConfig = {
  codDeliveryFee: number;
  freeShippingThreshold: number;
  prepaidDiscountPercent: number;
  autoApplyCoupon: string;
  paymentMethods: Record<string, CheckoutPaymentMethod>;
};

export type CheckoutShippingConfig = {
  codDeliveryFee: number;
  freeShippingThreshold: number;
};

export const DEFAULT_CHECKOUT_CONFIG = {
  codDeliveryFee: 200,
  freeShippingThreshold: 5000,
  prepaidDiscountPercent: 10,
  autoApplyCoupon: '',
} as const;

export const DEFAULT_CHECKOUT_PAYMENT_METHODS: Record<
  string,
  CheckoutPaymentMethod
> = {
  cod: {
    id: 'cod',
    name: 'Cash on Delivery',
    nameUr: 'کیش آن ڈیلیوری',
    description: 'Pay when you receive',
    descriptionUr: 'موصول ہونے پر ادائیگی کریں',
    deliveryFee: DEFAULT_CHECKOUT_CONFIG.codDeliveryFee,
    requiresVerification: false,
  },
  easypaisa: {
    id: 'easypaisa',
    name: 'EasyPaisa / JazzCash',
    nameUr: 'ایزی پیسہ / جاز کیش',
    description: 'Order first, get wallet details next',
    descriptionUr: 'پہلے آرڈر کریں، پھر والیٹ تفصیلات دیکھیں',
    deliveryFee: 0,
    requiresVerification: true,
  },
  bank: {
    id: 'bank',
    name: 'Bank Transfer',
    nameUr: 'بینک ٹرانسفر',
    description: 'Order first, get bank details next',
    descriptionUr: 'پہلے آرڈر کریں، پھر بینک تفصیلات دیکھیں',
    deliveryFee: 0,
    requiresVerification: true,
  },
};

function clonePaymentMethods(): Record<string, CheckoutPaymentMethod> {
  return Object.fromEntries(
    Object.entries(DEFAULT_CHECKOUT_PAYMENT_METHODS).map(([key, method]) => [
      key,
      { ...method },
    ]),
  );
}

export function getDefaultCheckoutConfig(): CheckoutConfig {
  return {
    ...DEFAULT_CHECKOUT_CONFIG,
    paymentMethods: clonePaymentMethods(),
  };
}

function toNonNegativeInteger(value: unknown, fallback: number): number {
  return typeof value !== 'number' || Number.isNaN(value) || value < 0
    ? fallback
    : Math.round(value);
}

function toStringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toBooleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeMethod(
  rawKey: string,
  rawValue: unknown,
  codDeliveryFee: number,
): CheckoutPaymentMethod | null {
  if (!rawValue || typeof rawValue !== 'object') {
    return null;
  }

  const parsed = rawValue as Record<string, unknown>;
  const id =
    typeof parsed.id === 'string' && parsed.id.trim().length > 0
      ? parsed.id.trim().toLowerCase()
      : rawKey.toLowerCase();

  if (!id) {
    return null;
  }

  const fallback = DEFAULT_CHECKOUT_PAYMENT_METHODS[id] || {
    id,
    name: id,
    nameUr: id,
    description: id === 'cod' ? 'Pay when you receive' : 'Online payment',
    descriptionUr:
      id === 'cod' ? 'موصول ہونے پر ادائیگی کریں' : 'آن لائن ادائیگی',
    deliveryFee: id === 'cod' ? codDeliveryFee : 0,
    requiresVerification: id !== 'cod',
  };
  const deliveryFee = toNonNegativeInteger(
    parsed.deliveryFee,
    fallback.deliveryFee,
  );

  return {
    id,
    name: toStringValue(parsed.name, fallback.name),
    nameUr: toStringValue(parsed.nameUr, fallback.nameUr),
    description: toStringValue(parsed.description, fallback.description),
    descriptionUr: toStringValue(
      parsed.descriptionUr,
      fallback.descriptionUr,
    ),
    deliveryFee: id === 'cod' ? codDeliveryFee : deliveryFee,
    requiresVerification:
      id !== 'cod' &&
      toBooleanValue(
        parsed.requiresVerification,
        fallback.requiresVerification,
      ),
  };
}

export function safeParseSettingJson(
  value: string | null | undefined,
): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function normalizeCheckoutConfig(
  rawCheckoutConfig: unknown,
  rawPaymentMethods: unknown,
): CheckoutConfig {
  const parsedCheckout =
    rawCheckoutConfig && typeof rawCheckoutConfig === 'object'
      ? (rawCheckoutConfig as Record<string, unknown>)
      : {};
  const codDeliveryFee = toNonNegativeInteger(
    parsedCheckout.codDeliveryFee,
    DEFAULT_CHECKOUT_CONFIG.codDeliveryFee,
  );
  const paymentSource =
    rawPaymentMethods && typeof rawPaymentMethods === 'object'
      ? (rawPaymentMethods as Record<string, unknown>)
      : {};
  const paymentMethods = clonePaymentMethods();

  for (const [key, value] of Object.entries(paymentSource)) {
    const normalized = normalizeMethod(key, value, codDeliveryFee);

    if (normalized) {
      paymentMethods[normalized.id] = normalized;
    }
  }

  paymentMethods.cod = {
    ...(paymentMethods.cod || DEFAULT_CHECKOUT_PAYMENT_METHODS.cod),
    id: 'cod',
    deliveryFee: codDeliveryFee,
    requiresVerification: false,
  };

  return {
    codDeliveryFee,
    freeShippingThreshold: toNonNegativeInteger(
      parsedCheckout.freeShippingThreshold,
      DEFAULT_CHECKOUT_CONFIG.freeShippingThreshold,
    ),
    prepaidDiscountPercent: toNonNegativeInteger(
      parsedCheckout.prepaidDiscountPercent,
      DEFAULT_CHECKOUT_CONFIG.prepaidDiscountPercent,
    ),
    autoApplyCoupon: toStringValue(
      parsedCheckout.autoApplyCoupon,
      DEFAULT_CHECKOUT_CONFIG.autoApplyCoupon,
    )
      .toUpperCase()
      .trim(),
    paymentMethods,
  };
}

export function getCheckoutShippingConfig(
  config: CheckoutConfig,
): CheckoutShippingConfig {
  return {
    codDeliveryFee: config.codDeliveryFee,
    freeShippingThreshold: config.freeShippingThreshold,
  };
}
