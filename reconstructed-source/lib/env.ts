/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the deployed Cloudflare Worker and the surviving source index.
 * This is not the byte-for-byte original TypeScript source.
 */

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export const isProduction = process.env.NODE_ENV === 'production';
