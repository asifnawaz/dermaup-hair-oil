/**
 * RECONSTRUCTED SOURCE
 *
 * The coupon schema is deployed-exact from Worker module 5989. The remaining
 * schemas preserve the indexed exports and the same validation literals that
 * survived in the compiled module before tree-shaking.
 */

import { z } from 'zod';

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameUr: z.string(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugPattern, 'Slug must be lowercase with hyphens only'),
  sku: z.string(),
});
export type ProductCreateForm = z.infer<typeof productCreateSchema>;

export const productEditSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameUr: z.string(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugPattern, 'Slug must be lowercase with hyphens only'),
  sku: z.string(),
  active: z.boolean(),
  description: z.string(),
  descriptionUr: z.string(),
});
export type ProductEditForm = z.infer<typeof productEditSchema>;

export const blockCreateSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  slug: z.string().min(1, 'Slug is required'),
  productId: z.string().nullable(),
  data: z.record(z.string(), z.string()),
});
export type BlockCreateForm = z.infer<typeof blockCreateSchema>;

export const blockEditSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  productId: z.string().nullable(),
  sortOrder: z.coerce.number().int().min(0),
  active: z.boolean(),
  data: z.record(z.string(), z.string()),
});
export type BlockEditForm = z.infer<typeof blockEditSchema>;

export const pageCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugPattern, 'Slug must be lowercase with hyphens only'),
  productId: z.string(),
  description: z.string(),
  keywords: z.string(),
});
export type PageCreateForm = z.infer<typeof pageCreateSchema>;

export const pageEditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugPattern, 'Slug must be lowercase with hyphens only'),
  productId: z.string(),
  description: z.string(),
  keywords: z.string(),
  active: z.boolean(),
});
export type PageEditForm = z.infer<typeof pageEditSchema>;

export const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().int().min(1, 'Value must be at least 1'),
  minOrder: z.coerce.number().int().min(0).default(0),
  maxUses: z.coerce.number().int().min(0).nullable().default(null),
  appliesTo: z.string().nullable().default(null),
  active: z.boolean().default(true),
  startsAt: z.string().default(''),
  expiresAt: z.string().default(''),
});
export type CouponForm = z.infer<typeof couponSchema>;
