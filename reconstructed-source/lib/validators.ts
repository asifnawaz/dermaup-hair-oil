/**
 * RECONSTRUCTED SOURCE
 *
 * Public schemas and helper signatures come from the surviving source index.
 * Schema literals, total calculation, and Zod error formatting were verified
 * against the latest deployed Worker. Tree-shaken admin-only helpers are
 * reconstructed from their indexed control-flow and token evidence.
 */

import { z } from 'zod';

import { PAKISTAN_CITIES } from './constants';

export const pakistaniPhoneRegex = /^(03\d{9}|923\d{9}|\+923\d{9})$/;

export const phoneSchema = z
  .string()
  .min(11, 'Phone number is required')
  .transform((value) => value.replace(/[\s-]/g, ''))
  .refine((value) => pakistaniPhoneRegex.test(value), {
    message: 'Please enter a valid Pakistani phone number',
  });

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

export const orderFormSchema = z.object({
  customerName: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  city: z.enum(PAKISTAN_CITIES, {
    errorMap: () => ({ message: 'Please select a city' }),
  }),
  address: z
    .string()
    .min(10, 'Please enter a complete address')
    .max(500, 'Address is too long'),
  packageType: z
    .string()
    .min(1, 'Please select a package')
    .max(100, 'Invalid package type'),
  paymentMethod: z
    .string()
    .min(1, 'Please select a payment method')
    .max(50, 'Invalid payment method'),
  language: z.enum(['en', 'ur']).default('en'),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

export const subscribeFormSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    name: z.string().optional(),
    phone: phoneSchema.optional().or(z.literal('')),
    source: z
      .enum(['checkout', 'popup', 'footer', 'exit_popup'])
      .default('footer'),
  })
  .refine(
    (data) =>
      (data.email && data.email.length > 0) ||
      (data.phone && data.phone.length > 0),
    {
      message: 'Please provide either a phone number or email',
      path: ['phone'],
    },
  );

export type SubscribeFormData = z.infer<typeof subscribeFormSchema>;

export type DynamicPackage = {
  price: number;
  bottles: number;
  originalPrice?: number;
  freeDelivery?: boolean;
};

export type DynamicPaymentMethod = {
  deliveryFee: number;
  requiresVerification?: boolean;
};

export function calculateOrderTotals(
  packageType: string,
  paymentMethod: string,
  dynamicPackages?: Record<string, DynamicPackage>,
  dynamicPaymentMethods?: Record<string, DynamicPaymentMethod>,
): {
  subtotal: number;
  deliveryFee: number;
  total: number;
  quantity: number;
} {
  const pkgSource = dynamicPackages || {};
  const paySource = dynamicPaymentMethods || {};
  const pkg = pkgSource[packageType] || {
    price: 0,
    bottles: 1,
    freeDelivery: false,
  };
  const payment = paySource[paymentMethod] || { deliveryFee: 0 };
  const deliveryFee = pkg.freeDelivery ? 0 : payment.deliveryFee;

  return {
    subtotal: pkg.price,
    deliveryFee,
    total: pkg.price + deliveryFee,
    quantity: pkg.bottles,
  };
}

export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string,
): boolean {
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 500);
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');

    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}
