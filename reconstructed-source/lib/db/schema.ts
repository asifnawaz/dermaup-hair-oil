/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the deployed Cloudflare Worker, surviving symbol indexes, and
 * the live D1 schema. Definitions below follow the latest deployed Worker.
 * This is not the byte-for-byte original TypeScript source.
 */

import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const PACKAGE_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  MULTI: 'multi',
} as const;
export type PackageType = (typeof PACKAGE_TYPES)[keyof typeof PACKAGE_TYPES];

export const PAYMENT_METHODS = {
  COD: 'cod',
  EASYPAISA: 'easypaisa',
  BANK: 'bank',
} as const;
export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
} as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const SUBSCRIBER_SOURCE = {
  CHECKOUT: 'checkout',
  POPUP: 'popup',
  FOOTER: 'footer',
  EXIT_POPUP: 'exit_popup',
} as const;
export type SubscriberSource =
  (typeof SUBSCRIBER_SOURCE)[keyof typeof SUBSCRIBER_SOURCE];

export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').unique().notNull(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone').notNull(),
    city: text('city').notNull(),
    address: text('address').notNull(),
    packageType: text('package_type').notNull().$type<PackageType>(),
    quantity: integer('quantity').notNull(),
    subtotal: integer('subtotal').notNull(),
    deliveryFee: integer('delivery_fee').notNull(),
    total: integer('total').notNull(),
    // Present in the deployed Worker model but absent from the recovered live
    // D1 `orders` table. A migration is required before these fields are used.
    couponCode: text('coupon_code'),
    couponDiscount: integer('coupon_discount').default(0),
    paymentMethod: text('payment_method').notNull().$type<PaymentMethod>(),
    paymentStatus: text('payment_status')
      .default(PAYMENT_STATUS.PENDING)
      .$type<PaymentStatus>(),
    paymentScreenshotUrl: text('payment_screenshot_url'),
    orderStatus: text('order_status')
      .default(ORDER_STATUS.PENDING)
      .$type<OrderStatus>(),
    courierName: text('courier_name'),
    trackingNumber: text('tracking_number'),
    trackingUrl: text('tracking_url'),
    language: text('language').default('en').$type<'en' | 'ur'>(),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
    shippedAt: text('shipped_at'),
    deliveredAt: text('delivered_at'),
  },
  (table) => ({
    statusIdx: index('orders_status_idx').on(table.orderStatus),
    paymentStatusIdx: index('orders_payment_status_idx').on(table.paymentStatus),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
    cityIdx: index('orders_city_idx').on(table.city),
  }),
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const subscribers = sqliteTable(
  'subscribers',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    name: text('name'),
    phone: text('phone'),
    source: text('source').$type<SubscriberSource>(),
    subscribedAt: text('subscribed_at').default(sql`(datetime('now'))`),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
  },
  (table) => ({
    emailIdx: index('subscribers_email_idx').on(table.email),
    activeIdx: index('subscribers_active_idx').on(table.isActive),
  }),
);

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;

export const analyticsEvents = sqliteTable(
  'analytics_events',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    eventData: text('event_data'),
    sessionId: text('session_id'),
    userAgent: text('user_agent'),
    ipCountry: text('ip_country'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    eventTypeIdx: index('analytics_event_type_idx').on(table.eventType),
    sessionIdx: index('analytics_session_idx').on(table.sessionId),
    createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
  }),
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export const ADMIN_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;
export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

export const ORDER_ACTIONS = {
  CREATED: 'created',
  PAYMENT_VERIFIED: 'payment_verified',
  PAYMENT_FAILED: 'payment_failed',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  EMAIL_SENT: 'email_sent',
  NOTE_ADDED: 'note_added',
} as const;
export type OrderAction = (typeof ORDER_ACTIONS)[keyof typeof ORDER_ACTIONS];

export const EMAIL_TYPES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  PAYMENT_VERIFIED: 'payment_verified',
  ORDER_SHIPPED: 'order_shipped',
  DELIVERY_REMINDER: 'delivery_reminder',
  POST_DELIVERY: 'post_delivery',
} as const;
export type EmailType = (typeof EMAIL_TYPES)[keyof typeof EMAIL_TYPES];

export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;
export type EmailStatus = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];

export const adminUsers = sqliteTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: text('role').default(ADMIN_ROLES.ADMIN).$type<AdminRole>(),
    lastLogin: text('last_login'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    emailIdx: index('admin_users_email_idx').on(table.email),
  }),
);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export const orderActivity = sqliteTable(
  'order_activity',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id').notNull(),
    action: text('action').notNull().$type<OrderAction>(),
    details: text('details'),
    performedBy: text('performed_by'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    orderIdIdx: index('order_activity_order_id_idx').on(table.orderId),
    actionIdx: index('order_activity_action_idx').on(table.action),
    createdAtIdx: index('order_activity_created_at_idx').on(table.createdAt),
  }),
);

export type OrderActivityLog = typeof orderActivity.$inferSelect;
export type NewOrderActivityLog = typeof orderActivity.$inferInsert;

export const emailLog = sqliteTable(
  'email_log',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id'),
    subscriberId: text('subscriber_id'),
    emailType: text('email_type').notNull().$type<EmailType>(),
    recipientEmail: text('recipient_email').notNull(),
    subject: text('subject').notNull(),
    status: text('status').default(EMAIL_STATUS.PENDING).$type<EmailStatus>(),
    sentAt: text('sent_at'),
    errorMessage: text('error_message'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    orderIdIdx: index('email_log_order_id_idx').on(table.orderId),
    emailTypeIdx: index('email_log_email_type_idx').on(table.emailType),
    statusIdx: index('email_log_status_idx').on(table.status),
    createdAtIdx: index('email_log_created_at_idx').on(table.createdAt),
  }),
);

export type EmailLogEntry = typeof emailLog.$inferSelect;
export type NewEmailLogEntry = typeof emailLog.$inferInsert;

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    slug: text('slug').unique().notNull(),
    name: text('name').notNull(),
    nameUr: text('name_ur'),
    sku: text('sku'),
    category: text('category').default('hair_care'),
    shortDescription: text('short_description'),
    shortDescriptionUr: text('short_description_ur'),
    imageUrl: text('image_url'),
    badge: text('badge'),
    badgeUr: text('badge_ur'),
    data: text('data').notNull(),
    active: integer('active', { mode: 'boolean' }).default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    slugIdx: index('products_slug_idx').on(table.slug),
    activeIdx: index('products_active_idx').on(table.active),
    categoryIdx: index('products_category_idx').on(table.category),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const PRODUCT_CATEGORIES = {
  HAIR_CARE: 'hair_care',
  SKIN_CARE: 'skin_care',
} as const;
export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id').notNull(),
    productId: text('product_id').notNull(),
    productSlug: text('product_slug').notNull(),
    productName: text('product_name').notNull(),
    packageType: text('package_type').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: integer('unit_price').notNull(),
    subtotal: integer('subtotal').notNull(),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
  }),
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const CONTENT_BLOCK_TYPES = {
  TESTIMONIAL: 'testimonial',
  FAQ: 'faq',
  INGREDIENT: 'ingredient',
  BEFORE_AFTER: 'before_after',
  BENEFIT: 'benefit',
  HOW_TO_USE: 'how_to_use',
  SOCIAL_PROOF: 'social_proof',
  COMPARISON: 'comparison',
  RESULT: 'result',
  EDUCATION: 'education',
  INSIDE_OUT_SUPPORT: 'inside_out_support',
  EXPERT_REVIEW: 'expert_review',
} as const;
export type ContentBlockType =
  (typeof CONTENT_BLOCK_TYPES)[keyof typeof CONTENT_BLOCK_TYPES];

export const contentBlocks = sqliteTable(
  'content_blocks',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull().$type<ContentBlockType>(),
    slug: text('slug').notNull(),
    productId: text('product_id'),
    data: text('data').notNull(),
    active: integer('active', { mode: 'boolean' }).default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    typeIdx: index('content_blocks_type_idx').on(table.type),
    typeSlugIdx: index('content_blocks_type_slug_idx').on(
      table.type,
      table.slug,
    ),
    productIdx: index('content_blocks_product_idx').on(table.productId),
    activeIdx: index('content_blocks_active_idx').on(table.active),
  }),
);

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;

export const pages = sqliteTable(
  'pages',
  {
    id: text('id').primaryKey(),
    slug: text('slug').unique().notNull(),
    productId: text('product_id'),
    title: text('title').notNull(),
    type: text('type').default('page'),
    meta: text('meta'),
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    slugIdx: index('pages_slug_idx').on(table.slug),
    productIdx: index('pages_product_idx').on(table.productId),
    activeIdx: index('pages_active_idx').on(table.active),
  }),
);

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export const SECTION_TYPES = {
  PROMO_BANNER: 'promo_banner',
  HERO: 'hero',
  PROBLEM: 'problem',
  SOLUTION: 'solution',
  INGREDIENTS: 'ingredients',
  TESTIMONIALS: 'testimonials',
  PRICING: 'pricing',
  FAQ: 'faq',
  CHECKOUT: 'checkout',
  FINAL_CTA: 'cta',
  HOW_IT_WORKS: 'how_it_works',
  EDUCATION: 'education',
  RESULTS: 'results',
  REVIEWS: 'reviews',
  EXIT_INTENT: 'exit_intent',
  BEFORE_AFTER: 'before_after',
  BENEFITS: 'benefits',
  SOCIAL_PROOF_BAR: 'social_proof_bar',
  VIDEO: 'video',
  COMPARISON: 'comparison',
  IMAGE_STORY: 'image_story',
  CLINICAL_STATS: 'clinical_stats',
  FEATURED_PRODUCTS: 'featured_products',
  FEATURED_CATEGORIES: 'featured_categories',
  PRODUCT_HERO: 'product_hero',
  GUARANTEE: 'guarantee',
  RESULTS_TIMELINE: 'results_timeline',
  RELATED_PRODUCTS: 'related_products',
  CROSS_SELL: 'cross_sell',
  POLICY_CONTENT: 'policy_content',
  ARTICLE_BODY: 'article_body',
  ADVERT_URGENCY_BANNER: 'advert_urgency_banner',
  ADVERT_FINAL_CTA: 'advert_final_cta',
} as const;
export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

export const pageSections = sqliteTable(
  'page_sections',
  {
    id: text('id').primaryKey(),
    pageId: text('page_id').notNull(),
    sectionType: text('section_type').notNull().$type<SectionType>(),
    sortOrder: integer('sort_order').notNull().default(0),
    config: text('config'),
    active: integer('active', { mode: 'boolean' }).default(true),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    pageIdx: index('page_sections_page_idx').on(table.pageId),
    pageSortIdx: index('page_sections_page_sort_idx').on(
      table.pageId,
      table.sortOrder,
    ),
    activeIdx: index('page_sections_active_idx').on(table.active),
  }),
);

export type PageSection = typeof pageSections.$inferSelect;
export type NewPageSection = typeof pageSections.$inferInsert;

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    filename: text('filename').notNull(),
    alt: text('alt'),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    productId: text('product_id'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    productIdx: index('media_product_idx').on(table.productId),
    createdIdx: index('media_created_idx').on(table.createdAt),
  }),
);

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;
export type CouponType = (typeof COUPON_TYPES)[keyof typeof COUPON_TYPES];

export const coupons = sqliteTable(
  'coupons',
  {
    id: text('id').primaryKey(),
    code: text('code').unique().notNull(),
    type: text('type')
      .notNull()
      .default(COUPON_TYPES.PERCENTAGE)
      .$type<CouponType>(),
    value: integer('value').notNull(),
    minOrder: integer('min_order').default(0),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').default(0),
    appliesTo: text('applies_to'),
    active: integer('active', { mode: 'boolean' }).default(true),
    startsAt: text('starts_at'),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').default(sql`(datetime('now'))`),
    updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    codeIdx: index('coupons_code_idx').on(table.code),
    activeIdx: index('coupons_active_idx').on(table.active),
  }),
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
