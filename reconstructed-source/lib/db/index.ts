/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the deployed Cloudflare Worker and the surviving source index.
 * Runtime behavior matches the latest recovered production bundle. The
 * generateOrderNumber format is reconstructed from index-level evidence because
 * that unused helper was removed by production tree-shaking.
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './schema';

export type DrizzleDB = ReturnType<typeof drizzle>;

export interface CloudflareEnv {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
}

/**
 * Return the D1 binding when running inside Cloudflare.
 *
 * Static rendering and non-Cloudflare tooling deliberately receive `null`.
 */
export function getD1(): D1Database | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as CloudflareEnv).DB || null;
  } catch {
    return null;
  }
}

/**
 * Return the public-media R2 binding when running inside Cloudflare.
 */
export function getMediaBucket(): R2Bucket | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as CloudflareEnv).MEDIA_BUCKET || null;
  } catch {
    return null;
  }
}

export function getDb(d1: D1Database): DrizzleDB {
  return drizzle(d1, { schema });
}

/**
 * Generate a compact, roughly sortable identifier.
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const id = `${timestamp}${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(6, '0');
  return `UPD-${year}-${paddedSequence}`;
}
