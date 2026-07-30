import { cookies } from "next/headers";

import { DEFAULT_LANGUAGE, type Language } from "./constants";

export const LANG_COOKIE = "lang";
export const COOKIE_MAX_AGE = 31_536_000;

export async function getLanguage(): Promise<Language> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return value === "ur" ? "ur" : DEFAULT_LANGUAGE;
}

export function setLanguageCookie(lang: Language): string {
  return `${LANG_COOKIE}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
