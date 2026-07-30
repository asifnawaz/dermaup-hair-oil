import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function normalizeSectionHeading(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/[.:;,-]+$/, "");
}

export function isDistinctSectionLabel(
  label?: string | null,
  title?: string | null,
): boolean {
  if (!label?.trim()) return false;
  if (!title?.trim()) return true;
  return normalizeSectionHeading(label).toLowerCase() !==
    normalizeSectionHeading(title).toLowerCase();
}

export function formatPrice(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function formatPriceShort(amount: number): string {
  return amount >= 1000
    ? `PKR ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
    : formatPrice(amount);
}

export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (/^92\d{10}$/.test(normalized)) {
    return `0${normalized.slice(2, 5)}-${normalized.slice(5, 12)}`;
  }
  if (/^03\d{9}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
  }
  return phone;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0092")) return digits.slice(2);
  if (digits.startsWith("03") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  if (digits.startsWith("3") && digits.length === 10) return `92${digits}`;
  return digits;
}

export function isValidPakistaniPhone(phone: string): boolean {
  return /^923\d{9}$/.test(normalizePhone(phone));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function generateId(prefix?: string): string {
  const value = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  return prefix ? `${prefix}_${value}` : value;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength
    ? text
    : `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function formatDate(
  date: string | Date,
  locale: "en" | "ur" = "en",
): string {
  return new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return formatter.format(seconds, "second");
}

export function scrollToElement(elementId: string): void {
  document.getElementById(elementId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function getCookie(name: string): string | null {
  if (!isClient()) return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (!isClient()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
    days * 86_400
  }; SameSite=Lax`;
}
