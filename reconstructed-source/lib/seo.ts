const DEFAULT_SITE_URL = "https://upderma.com";

export type PageSeoMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function getSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/+$/, "");
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, getMetadataBase()).toString();
}

export function toDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function parsePageSeoMeta(value?: string | null): PageSeoMeta | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as PageSeoMeta : null;
  } catch {
    return null;
  }
}
