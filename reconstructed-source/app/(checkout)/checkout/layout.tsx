import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - UpDerma",
  description:
    "Complete your order — Cash on Delivery available nationwide.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
