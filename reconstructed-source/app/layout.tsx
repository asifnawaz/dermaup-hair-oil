import "./globals.css";

import {
  bodyFont,
  displayFont,
  urduBodyFont,
  urduDisplayFont,
} from "@/lib/fonts";
import { getDirection } from "@/lib/i18n";
import { getLanguage } from "@/lib/language";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLanguage();
  const dir = getDirection(lang);
  const className = [
    bodyFont.variable,
    displayFont.variable,
    lang === "ur" ? urduBodyFont.variable : "",
    lang === "ur" ? urduDisplayFont.variable : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang={lang} dir={dir} className={className}>
      <body>{children}</body>
    </html>
  );
}
