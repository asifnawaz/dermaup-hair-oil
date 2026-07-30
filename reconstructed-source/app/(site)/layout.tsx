import type { Metadata } from "next";
import type { ReactNode } from "react";

import { BackToTop } from "@/components/shared/back-to-top";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getCheckoutShippingConfig } from "@/lib/checkout-config";
import { isRTL } from "@/lib/i18n";
import { getLanguage } from "@/lib/language";
import { absoluteUrl, getMetadataBase } from "@/lib/seo";
import { getCurrentStorefrontSettings } from "@/lib/store-settings.server";
import {
  getPaymentMethodDisplayNames,
  getPromoBannerText,
  getStoreWhatsAppLinks,
} from "@/lib/store-settings";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "UpDerma - Hair Care & Skin Care | Natural Beauty Solutions",
  description:
    "Shop UpDerma's range of natural hair care and skin care products. Research-backed formulations with glutathione, retinol, rice extract & more. Cash on Delivery across Pakistan.",
  keywords: [
    "hair growth oil",
    "skin care Pakistan",
    "UpDerma",
    "glutathione cream",
    "anti aging cream",
    "brightening serum",
    "anti acne serum",
    "natural beauty",
    "hair loss treatment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "UpDerma - Hair Care & Skin Care",
    description:
      "Dermatologist-reviewed, research-backed formulations. COD available nationwide.",
    type: "website",
    locale: "en_PK",
    url: absoluteUrl("/"),
  },
};

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const lang = await getLanguage();
  const isRtl = isRTL(lang);
  const storeSettings = await getCurrentStorefrontSettings();
  const showWhatsApp = storeSettings.contact.showFloatingButton !== false;
  const whatsappLinks = getStoreWhatsAppLinks(storeSettings.contact);
  const promoBannerText = getPromoBannerText(
    storeSettings.promoBanner,
    lang,
    storeSettings.checkoutConfig.freeShippingThreshold,
  );
  const shippingConfig = getCheckoutShippingConfig(
    storeSettings.checkoutConfig,
  );
  const paymentMethodLabels = getPaymentMethodDisplayNames(
    storeSettings.checkoutConfig,
    lang,
  );

  return (
    <>
      <Header
        lang={lang}
        promoBannerText={promoBannerText}
        whatsappUrl={whatsappLinks.general}
        shippingConfig={shippingConfig}
      />
      <main>{children}</main>
      <Footer
        lang={lang}
        contactEmail={storeSettings.contact.email}
        whatsappUrl={whatsappLinks.general}
        paymentMethodLabels={paymentMethodLabels}
      />
      <BackToTop />
      {showWhatsApp && (
        <WhatsAppButton
          lang={lang}
          isRtl={isRtl}
          whatsappUrl={whatsappLinks.general}
        />
      )}
    </>
  );
}
