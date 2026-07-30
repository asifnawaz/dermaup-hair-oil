/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the server-only storefront settings module in the latest
 * deployed Cloudflare Worker and cross-checked against the source index.
 */

import { getCachedSettings } from './content';
import { getD1, getDb, type DrizzleDB } from './db';
import {
  getDefaultStorefrontSettings,
  normalizeStorefrontSettings,
  type StorefrontSettings,
} from './store-settings';

export async function getStorefrontSettingsForDb(
  db: DrizzleDB,
): Promise<StorefrontSettings> {
  const rawSettings = await getCachedSettings(db);
  return normalizeStorefrontSettings(rawSettings);
}

export async function getCurrentStorefrontSettings(): Promise<StorefrontSettings> {
  const d1 = getD1();

  if (!d1) {
    return getDefaultStorefrontSettings();
  }

  return getStorefrontSettingsForDb(getDb(d1));
}
