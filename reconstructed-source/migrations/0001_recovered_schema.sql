-- Recovered from Cloudflare D1 database upderma-db on 2026-07-30.
-- Schema only: no customer, order, subscriber, credential, analytics, or email data.

-- table: admin_users
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'admin',
	`last_login` text,
	`created_at` text DEFAULT (datetime('now'))
);

-- table: analytics_events
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`event_data` text,
	`session_id` text,
	`user_agent` text,
	`ip_country` text,
	`created_at` text DEFAULT (datetime('now'))
);

-- table: content_blocks
CREATE TABLE `content_blocks` (
  `id` text PRIMARY KEY NOT NULL,
  `type` text NOT NULL,
  `slug` text NOT NULL,
  `product_id` text,
  `data` text NOT NULL,
  `active` integer DEFAULT true,
  `sort_order` integer DEFAULT 0,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
);

-- table: coupons
CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value INTEGER NOT NULL,
  min_order INTEGER DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  applies_to TEXT,
  active INTEGER DEFAULT 1,
  starts_at TEXT,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- table: d1_migrations
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- table: email_log
CREATE TABLE `email_log` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`subscriber_id` text,
	`email_type` text NOT NULL,
	`recipient_email` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'pending',
	`sent_at` text,
	`error_message` text,
	`created_at` text DEFAULT (datetime('now'))
);

-- table: media
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  filename TEXT NOT NULL,
  alt TEXT,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  product_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- table: order_activity
CREATE TABLE `order_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`performed_by` text,
	`created_at` text DEFAULT (datetime('now'))
);

-- table: order_items
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- table: orders
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`package_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`delivery_fee` integer NOT NULL,
	`total` integer NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'pending',
	`payment_screenshot_url` text,
	`order_status` text DEFAULT 'pending',
	`courier_name` text,
	`tracking_number` text,
	`language` text DEFAULT 'en',
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`shipped_at` text,
	`delivered_at` text
, tracking_url TEXT);

-- table: page_sections
CREATE TABLE `page_sections` (
  `id` text PRIMARY KEY NOT NULL,
  `page_id` text NOT NULL,
  `section_type` text NOT NULL,
  `sort_order` integer NOT NULL DEFAULT 0,
  `config` text,
  `active` integer DEFAULT true,
  `created_at` text DEFAULT (datetime('now'))
);

-- table: pages
CREATE TABLE `pages` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `product_id` text,
  `title` text NOT NULL,
  `meta` text,
  `active` integer DEFAULT true,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
, type TEXT DEFAULT 'page');

-- table: products
CREATE TABLE `products` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `name_ur` text,
  `sku` text,
  `data` text NOT NULL,
  `active` integer DEFAULT true,
  `sort_order` integer DEFAULT 0,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
, category TEXT DEFAULT 'hair_care', short_description TEXT, short_description_ur TEXT, image_url TEXT, badge TEXT, badge_ur TEXT);

-- table: settings
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now'))
);

-- table: site_settings
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- table: subscribers
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`phone` text,
	`source` text,
	`subscribed_at` text DEFAULT (datetime('now')),
	`is_active` integer DEFAULT true
);

-- index: admin_users_email_idx
CREATE INDEX `admin_users_email_idx` ON `admin_users` (`email`);

-- index: admin_users_email_unique
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);

-- index: analytics_created_at_idx
CREATE INDEX `analytics_created_at_idx` ON `analytics_events` (`created_at`);

-- index: analytics_event_type_idx
CREATE INDEX `analytics_event_type_idx` ON `analytics_events` (`event_type`);

-- index: analytics_session_idx
CREATE INDEX `analytics_session_idx` ON `analytics_events` (`session_id`);

-- index: content_blocks_active_idx
CREATE INDEX `content_blocks_active_idx` ON `content_blocks` (`active`);

-- index: content_blocks_product_idx
CREATE INDEX `content_blocks_product_idx` ON `content_blocks` (`product_id`);

-- index: content_blocks_type_idx
CREATE INDEX `content_blocks_type_idx` ON `content_blocks` (`type`);

-- index: content_blocks_type_slug_idx
CREATE INDEX `content_blocks_type_slug_idx` ON `content_blocks` (`type`, `slug`);

-- index: coupons_active_idx
CREATE INDEX coupons_active_idx ON coupons(active);

-- index: coupons_code_idx
CREATE UNIQUE INDEX coupons_code_idx ON coupons(code);

-- index: email_log_created_at_idx
CREATE INDEX `email_log_created_at_idx` ON `email_log` (`created_at`);

-- index: email_log_email_type_idx
CREATE INDEX `email_log_email_type_idx` ON `email_log` (`email_type`);

-- index: email_log_order_id_idx
CREATE INDEX `email_log_order_id_idx` ON `email_log` (`order_id`);

-- index: email_log_status_idx
CREATE INDEX `email_log_status_idx` ON `email_log` (`status`);

-- index: media_created_idx
CREATE INDEX media_created_idx ON media(created_at);

-- index: media_product_idx
CREATE INDEX media_product_idx ON media(product_id);

-- index: order_activity_action_idx
CREATE INDEX `order_activity_action_idx` ON `order_activity` (`action`);

-- index: order_activity_created_at_idx
CREATE INDEX `order_activity_created_at_idx` ON `order_activity` (`created_at`);

-- index: order_activity_order_id_idx
CREATE INDEX `order_activity_order_id_idx` ON `order_activity` (`order_id`);

-- index: order_items_order_id_idx
CREATE INDEX order_items_order_id_idx ON order_items(order_id);

-- index: order_items_product_id_idx
CREATE INDEX order_items_product_id_idx ON order_items(product_id);

-- index: orders_city_idx
CREATE INDEX `orders_city_idx` ON `orders` (`city`);

-- index: orders_created_at_idx
CREATE INDEX `orders_created_at_idx` ON `orders` (`created_at`);

-- index: orders_order_number_unique
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);

-- index: orders_payment_status_idx
CREATE INDEX `orders_payment_status_idx` ON `orders` (`payment_status`);

-- index: orders_status_idx
CREATE INDEX `orders_status_idx` ON `orders` (`order_status`);

-- index: page_sections_active_idx
CREATE INDEX `page_sections_active_idx` ON `page_sections` (`active`);

-- index: page_sections_page_idx
CREATE INDEX `page_sections_page_idx` ON `page_sections` (`page_id`);

-- index: page_sections_page_sort_idx
CREATE INDEX `page_sections_page_sort_idx` ON `page_sections` (`page_id`, `sort_order`);

-- index: pages_active_idx
CREATE INDEX `pages_active_idx` ON `pages` (`active`);

-- index: pages_product_idx
CREATE INDEX `pages_product_idx` ON `pages` (`product_id`);

-- index: pages_slug_idx
CREATE INDEX `pages_slug_idx` ON `pages` (`slug`);

-- index: pages_slug_unique
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);

-- index: products_active_idx
CREATE INDEX `products_active_idx` ON `products` (`active`);

-- index: products_category_idx
CREATE INDEX products_category_idx ON products(category);

-- index: products_slug_idx
CREATE INDEX `products_slug_idx` ON `products` (`slug`);

-- index: products_slug_unique
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);

-- index: subscribers_active_idx
CREATE INDEX `subscribers_active_idx` ON `subscribers` (`is_active`);

-- index: subscribers_email_idx
CREATE INDEX `subscribers_email_idx` ON `subscribers` (`email`);

-- index: subscribers_email_unique
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);


