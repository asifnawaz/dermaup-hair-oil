'use client';

/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from client module 98125 in the latest deployed Worker and
 * cross-checked against the surviving source index. Event names and payloads
 * follow production, including newer order_placed/initiate_checkout events.
 */

import { isClient } from './utils';

declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
      set: (key: string, value: unknown) => void;
      ecommerce: (
        eventName: string,
        properties?: Record<string, unknown>,
      ) => void;
    };
  }
}

/**
 * Check if Zaraz is available.
 */
export function isZarazAvailable(): boolean {
  return isClient() && window.zaraz !== undefined;
}

/**
 * Send event to backend for database storage.
 */
async function storeEventInDB(
  eventName: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, properties }),
    });
  } catch (error) {
    console.debug('[Track] Failed to store event:', error);
  }
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  void storeEventInDB(eventName, properties);

  if (!isZarazAvailable()) {
    console.debug(
      '[Zaraz] Not available, event tracked to DB only:',
      eventName,
    );
    return;
  }

  try {
    window.zaraz!.track(eventName, properties);
    console.debug('[Zaraz] Event tracked:', eventName, properties);
  } catch (error) {
    console.error('[Zaraz] Error tracking event:', error);
  }
}

export function setUserProperty(key: string, value: unknown): void {
  if (!isZarazAvailable()) return;

  try {
    window.zaraz!.set(key, value);
  } catch (error) {
    console.error('[Zaraz] Error setting user property:', error);
  }
}

export function trackEcommerce(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  if (!isZarazAvailable()) {
    console.debug(
      '[Zaraz] Not available, ecommerce event not tracked:',
      eventName,
    );
    return;
  }

  try {
    window.zaraz!.ecommerce(eventName, properties);
    console.debug('[Zaraz] Ecommerce event tracked:', eventName, properties);
  } catch (error) {
    console.error('[Zaraz] Error tracking ecommerce event:', error);
  }
}

export const analytics = {
  pageView(page: string, lang: 'en' | 'ur') {
    trackEvent('page_view', { page, language: lang });
  },

  scrollDepth(depth: 25 | 50 | 75 | 100) {
    trackEvent('scroll_depth', { depth });
  },

  timeOnPage(seconds: number) {
    trackEvent('time_on_page', { seconds });
  },

  faqClick(question: string) {
    trackEvent('faq_click', { question });
  },

  testimonialView(testimonialId: number) {
    trackEvent('testimonial_view', { testimonial_id: testimonialId });
  },

  videoPlay() {
    trackEvent('video_play');
  },

  videoComplete() {
    trackEvent('video_complete');
  },

  productViewed(product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }) {
    trackEvent('product_viewed', product);
    trackEcommerce('Product Viewed', {
      content_type: 'product',
      content_name: product.name,
      content_ids: [product.id],
      value: product.price,
      currency: 'PKR',
      content_category: product.category,
    });
  },

  productListViewed(
    category: string,
    products: { id: string; name: string }[],
  ) {
    trackEvent('product_list_viewed', {
      category,
      count: products.length,
    });
    trackEcommerce('Product List Viewed', {
      content_type: 'product_group',
      content_category: category,
      content_ids: products.map((product) => product.id),
    });
  },

  packageSelect(
    packageType: string,
    price: number,
    product?: { id: string; name: string },
  ) {
    trackEvent('package_select', {
      package: packageType,
      price,
      product_id: product?.id,
    });
  },

  addToCart(item: {
    id: string;
    name: string;
    price: number;
    quantity?: number;
    packageType?: string;
    source?: string;
  }) {
    const quantity = item.quantity || 1;
    const value = Math.max(0, Math.round(item.price * quantity));

    trackEvent('add_to_cart', {
      product_id: item.id,
      product_name: item.name,
      package: item.packageType,
      quantity,
      price: item.price,
      value,
      source: item.source,
    });
    trackEcommerce('Product Added', {
      content_type: 'product',
      content_name: item.name,
      content_ids: [item.id],
      contents: [{ id: item.id, quantity, item_price: item.price }],
      num_items: quantity,
      value,
      currency: 'PKR',
    });
  },

  productCardClick(product: {
    id?: string;
    slug: string;
    name: string;
    category?: string | null;
    source?: string;
  }) {
    trackEvent('product_card_click', {
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      category: product.category || undefined,
      source: product.source,
    });
  },

  checkoutStart(total: number, product?: { id: string; name: string }) {
    trackEvent('initiate_checkout', {
      total,
      product_id: product?.id,
    });
    trackEcommerce('Checkout Started', {
      content_type: 'product',
      content_name: product?.name,
      content_ids: product ? [product.id] : [],
      value: total,
      currency: 'PKR',
    });
  },

  formFieldFocus(fieldName: string) {
    trackEvent('form_field_focus', { field: fieldName });
  },

  paymentMethodSelect(method: string) {
    trackEvent('payment_method_select', { method });
  },

  orderSubmit(orderId: string, total: number, paymentMethod: string) {
    trackEvent('order_placed', {
      order_id: orderId,
      total,
      payment_method: paymentMethod,
    });
  },

  orderComplete(
    orderId: string,
    total: number,
    packageType: string,
    paymentMethod: string,
    product?: { id: string; name: string },
  ) {
    trackEvent('order_complete', {
      order_id: orderId,
      total,
      package: packageType,
      payment_method: paymentMethod,
      product_id: product?.id,
    });
    trackEcommerce('Order Completed', {
      content_type: 'product',
      content_name: product?.name || packageType,
      content_ids: product ? [product.id] : [],
      value: total,
      currency: 'PKR',
      order_id: orderId,
    });
  },

  initiateCheckout(
    items: { id: string; name: string; price: number }[],
    total: number,
  ) {
    trackEvent('initiate_checkout', {
      item_count: items.length,
      total,
    });
    trackEcommerce('Checkout Started', {
      content_type: 'product',
      content_ids: items.map((item) => item.id),
      contents: items.map((item) => ({
        id: item.id,
        quantity: 1,
        item_price: item.price,
      })),
      num_items: items.length,
      value: total,
      currency: 'PKR',
    });
  },

  checkoutFieldInteraction(
    field: string,
    action: 'focus' | 'complete' | 'error',
  ) {
    trackEvent('checkout_field_interaction', { field, action });
  },

  addPaymentInfo(method: string, total: number) {
    trackEvent('add_payment_info', { method, total });
    trackEcommerce('Payment Info Added', {
      payment_type: method,
      value: total,
      currency: 'PKR',
    });
  },

  checkoutSubmitAttempt(total: number, paymentMethod: string) {
    trackEvent('checkout_submit_attempt', {
      total,
      payment_method: paymentMethod,
    });
  },

  checkoutValidationError(field: string) {
    trackEvent('checkout_validation_error', { field });
  },

  purchase(
    orderId: string,
    total: number,
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[],
    paymentMethod: string,
  ) {
    trackEvent('order_placed', {
      order_id: orderId,
      total,
      payment_method: paymentMethod,
      item_count: items.length,
    });
    trackEcommerce('Order Completed', {
      content_type: 'product',
      content_ids: items.map((item) => item.id),
      contents: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      value: total,
      currency: 'PKR',
      order_id: orderId,
    });
  },

  checkoutAbandoned(total: number, filledFields: string[]) {
    trackEvent('checkout_abandoned', {
      total,
      filled_fields: filledFields.join(','),
    });
  },

  couponAttempt(code: string, success: boolean, discount?: number) {
    trackEvent(success ? 'coupon_applied' : 'coupon_failed', {
      code,
      discount,
    });
  },

  whatsappClick(context: string) {
    trackEvent('whatsapp_click', { context });
  },

  phoneClick() {
    trackEvent('phone_click');
  },

  emailSignup(source: string) {
    trackEvent('email_signup', { source });
  },

  exitIntentShown() {
    trackEvent('exit_intent_shown');
  },

  exitIntentConverted() {
    trackEvent('exit_intent_converted');
  },

  languageSwitch(from: string, to: string) {
    trackEvent('language_switch', { from, to });
  },

  ctaClick(section: string, buttonText: string) {
    trackEvent('cta_click', { section, button: buttonText });
  },
};

let scrollDepthsTracked = new Set<number>();

export function trackScrollDepth(): (() => void) | undefined {
  if (!isClient()) return;

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    const depths = [25, 50, 75, 100] as const;

    for (const depth of depths) {
      if (
        scrollPercent >= depth &&
        !scrollDepthsTracked.has(depth)
      ) {
        scrollDepthsTracked.add(depth);
        analytics.scrollDepth(depth);
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
    scrollDepthsTracked = new Set();
  };
}

export function trackTimeOnPage(): () => void {
  if (!isClient()) return () => {};

  const thresholds = [30, 60, 120, 300];
  const tracked = new Set<number>();
  const startTime = Date.now();
  const interval = setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);

    for (const threshold of thresholds) {
      if (seconds >= threshold && !tracked.has(threshold)) {
        tracked.add(threshold);
        analytics.timeOnPage(threshold);
      }
    }

    if (seconds >= 300) clearInterval(interval);
  }, 5000);

  return () => clearInterval(interval);
}
