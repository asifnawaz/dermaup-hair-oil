-- The deployed order route writes these two fields, while the recovered live
-- D1 schema predates them. This preview-only compatibility migration keeps the
-- reconstructed checkout testable without altering the recovered schema file.
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN coupon_discount INTEGER DEFAULT 0;
