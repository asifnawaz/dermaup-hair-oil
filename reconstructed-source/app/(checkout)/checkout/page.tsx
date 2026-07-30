import { getLanguage } from "@/lib/language";
import { getCurrentStorefrontSettings } from "@/lib/store-settings.server";

import CheckoutPageClient from "./checkout-client";

export default async function CheckoutPage() {
  const [lang, settings] = await Promise.all([
    getLanguage(),
    getCurrentStorefrontSettings(),
  ]);

  return (
    <CheckoutPageClient
      lang={lang}
      initialConfig={settings.checkoutConfig}
    />
  );
}
