import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation - UpDerma",
  description: "Your UpDerma order confirmation and next steps.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/thank-you" },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
