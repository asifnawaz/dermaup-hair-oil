/**
 * RECONSTRUCTED SOURCE
 *
 * The fetch-and-fallback flow is recovered from deployed server module 66356.
 * Fallback copy below uses the later D1-backed values captured in the public
 * route snapshots, so an unbound local preview remains visually representative
 * without reading production data.
 */

import {
  getCachedAllContentBlocksForProduct,
  getCachedPageWithSections,
  type ParsedPageSection,
} from "@/lib/content";
import { getD1, getDb } from "@/lib/db";
import { getLanguage } from "@/lib/language";

import LandingClient from "./landing-client";

export type PolicyPageSlug =
  | "privacy"
  | "refund"
  | "terms"
  | "delivery-returns";

export type PolicyBlock = {
  title: string;
  body: string;
  bullets?: string[];
};

export type PolicyFallbackConfig = {
  title: string;
  titleUr: string;
  eyebrow: string;
  eyebrowUr?: string;
  summary: string;
  summaryUr?: string;
  lastUpdated: string;
  lastUpdatedUr: string;
  blocks: PolicyBlock[];
  blocksUr: PolicyBlock[];
};

export function policyFallbackSection(
  slug: PolicyPageSlug,
): ParsedPageSection[] {
  return [
    {
      id: `policy_${slug.replace(/-/g, "_")}_fallback`,
      pageId: `page_${slug.replace(/-/g, "_")}`,
      sectionType: "policy_content",
      sortOrder: 10,
      config: JSON.stringify(POLICY_FALLBACKS[slug]),
      parsedConfig: POLICY_FALLBACKS[slug],
      active: true,
      createdAt: null,
    },
  ];
}

export async function renderPolicyPage(slug: PolicyPageSlug) {
  const lang = await getLanguage();
  const fallbackSections = policyFallbackSection(slug);
  const d1 = getD1();

  if (!d1) {
    return (
      <LandingClient
        lang={lang}
        pageSlug={slug}
        pageType="page"
        sections={fallbackSections}
        contentBlocks={[]}
      />
    );
  }

  const db = getDb(d1);
  const pageData = await getCachedPageWithSections(db, slug);

  if (!pageData || pageData.sections.length === 0) {
    return (
      <LandingClient
        lang={lang}
        pageSlug={slug}
        pageType="page"
        sections={fallbackSections}
        contentBlocks={[]}
      />
    );
  }

  const productId = pageData.product?.id ?? null;
  const contentBlocks = productId
    ? await getCachedAllContentBlocksForProduct(db, productId)
    : [];

  return (
    <LandingClient
      lang={lang}
      pageSlug={slug}
      pageType={pageData.page.type || "page"}
      pageTitle={pageData.page.title}
      sections={pageData.sections}
      product={pageData.product}
      contentBlocks={contentBlocks}
    />
  );
}

export const POLICY_FALLBACKS: Record<
  PolicyPageSlug,
  PolicyFallbackConfig
> = {
  privacy: {
    title: "Privacy Policy",
    titleUr: "رازداری کی پالیسی",
    eyebrow: "Privacy and data care",
    summary:
      "How we collect, protect, and use customer information when you browse, place an order, or contact support.",
    lastUpdated: "June 9, 2026",
    lastUpdatedUr: "9 جون 2026",
    blocks: [
      {
        title: "Information we collect",
        body:
          "We collect the details needed to process and deliver your order, support your routine, and keep the website working securely.",
        bullets: [
          "Name, phone number, email, city, and delivery address",
          "Order history, payment method, order status, and support messages",
          "Device, browser, analytics, referral, and conversion data",
        ],
      },
      {
        title: "How we use it",
        body:
          "Your information is used for fulfilment, support, fraud prevention, and improving the shopping experience.",
        bullets: [
          "Confirm and deliver orders",
          "Send order updates by WhatsApp, SMS, email, or phone",
          "Improve product pages, checkout, and customer support",
        ],
      },
      {
        title: "Sharing and protection",
        body:
          "We do not sell personal information. We only share what is necessary with delivery partners, payment providers, analytics tools, or legal authorities when required.",
        bullets: [
          "Courier partners receive delivery details",
          "Payment providers receive payment verification data",
          "Access is limited to authorised operations and support use",
        ],
      },
      {
        title: "Your choices",
        body:
          "You can ask us to correct your details, remove unnecessary data where legally possible, or stop marketing communication.",
        bullets: [
          "Contact support through the website, WhatsApp, or email",
          "You can disable browser cookies, but some features may work less smoothly",
        ],
      },
    ],
    blocksUr: [
      {
        title: "ہم کیا معلومات لیتے ہیں",
        body:
          "آرڈر، ڈیلیوری اور سپورٹ کے لیے ضروری معلومات محفوظ کی جاتی ہیں۔",
      },
      {
        title: "استعمال کا مقصد",
        body:
          "معلومات آرڈر مکمل کرنے، کسٹمر سپورٹ، فراڈ روکنے اور خریداری کا تجربہ بہتر بنانے کے لیے استعمال ہوتی ہیں۔",
      },
      {
        title: "حفاظت اور شیئرنگ",
        body:
          "ہم ذاتی معلومات فروخت نہیں کرتے۔ صرف ڈیلیوری، ادائیگی یا قانونی ضرورت کے مطابق ضروری معلومات شیئر ہوتی ہیں۔",
      },
      {
        title: "آپ کے حقوق",
        body:
          "آپ معلومات درست کروانے، غیر ضروری ڈیٹا حذف کروانے، یا مارکیٹنگ روکنے کے لیے رابطہ کر سکتے ہیں۔",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    titleUr: "رقم کی واپسی کی پالیسی",
    eyebrow: "Returns and routine confidence",
    summary:
      "You may request a refund within 90 days of delivery when the product is not right for your routine. Contact UpDerma on WhatsApp with your order number. Eligibility, return instructions, and any required product return are confirmed before a refund is issued.",
    summaryUr:
      "اگر پراڈکٹ آپ کی روٹین کے لیے موزوں نہ ہو تو ڈیلیوری کے 90 دن کے اندر ریفنڈ کی درخواست کی جا سکتی ہے۔ اپنے آرڈر نمبر کے ساتھ واٹس ایپ پر رابطہ کریں۔ ریفنڈ سے پہلے اہلیت اور واپسی کی ہدایات کی تصدیق کی جائے گی۔",
    lastUpdated: "July 22, 2026",
    lastUpdatedUr: "22 جولائی 2026",
    blocks: [
      {
        title: "Eligibility",
        body:
          "You may request a refund within 90 days of delivery when the product is not right for your routine. Contact support with your order details before returning anything.",
        bullets: [
          "The 90-day window starts on delivery",
          "Refund policy terms and verification apply",
          "Individual product results vary",
        ],
      },
      {
        title: "How to request help",
        body:
          "Message support with your order number, issue, and photos if the item is damaged, wrong, or not as expected.",
        bullets: [
          "Support reviews the case and replies with the next step",
          "Approved refunds are processed after verification",
          "Refund timing depends on payment method and bank/provider processing",
        ],
      },
      {
        title: "Damaged or wrong item",
        body:
          "If your item arrives damaged or incorrect, contact support within 48 hours of delivery.",
        bullets: [
          "Send clear photos of parcel and product",
          "We may arrange replacement, refund, or return instructions",
          "Wrong-item return shipping is handled according to support approval",
        ],
      },
      {
        title: "Non-refundable cases",
        body:
          "Some requests may be declined when verification is not possible or the issue falls outside policy.",
        bullets: [
          "No proof of purchase",
          "Late request after the eligible window",
          "Damage caused by misuse or improper storage",
        ],
      },
    ],
    blocksUr: [
      {
        title: "اہلیت",
        body:
          "اگر پراڈکٹ آپ کی روٹین کے لیے موزوں نہ ہو تو ڈیلیوری کے 90 دن کے اندر ریفنڈ کی درخواست کی جا سکتی ہے۔ کچھ واپس بھیجنے سے پہلے آرڈر کی تفصیل کے ساتھ سپورٹ سے رابطہ کریں۔",
      },
      {
        title: "درخواست کا طریقہ",
        body:
          "سپورٹ کو آرڈر نمبر، مسئلہ اور تصاویر بھیجیں۔ منظوری کے بعد اگلا مرحلہ بتایا جائے گا۔",
      },
      {
        title: "خراب یا غلط آئٹم",
        body:
          "خراب یا غلط پروڈکٹ ملنے پر 48 گھنٹوں کے اندر رابطہ کریں۔",
      },
      {
        title: "غیر قابل واپسی کیسز",
        body:
          "خریداری کا ثبوت نہ ہو، درخواست دیر سے آئے، یا نقصان غلط استعمال سے ہو تو درخواست مسترد ہو سکتی ہے۔",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    titleUr: "شرائط و ضوابط",
    eyebrow: "Website and order terms",
    summary:
      "The terms for using UpDerma, browsing products, placing orders, payments, delivery, product use, and support.",
    lastUpdated: "June 9, 2026",
    lastUpdatedUr: "9 جون 2026",
    blocks: [
      {
        title: "Using the website",
        body:
          "By browsing the website or placing an order, you agree to use UpDerma fairly and follow these terms.",
        bullets: [
          "Product images and descriptions are provided for guidance",
          "Results vary by person and routine consistency",
          "Products are intended for external cosmetic use unless stated otherwise",
        ],
      },
      {
        title: "Orders and payments",
        body:
          "Orders are confirmed after COD approval or payment verification. We may cancel or refuse orders where details cannot be verified.",
        bullets: [
          "Prices are in PKR",
          "Availability and promotional offers can change",
          "Payment options depend on current checkout settings",
        ],
      },
      {
        title: "Delivery and use",
        body:
          "Delivery timelines are estimates and depend on address accuracy, courier availability, and city coverage.",
        bullets: [
          "Provide accurate name, phone, and address",
          "Patch test before first use",
          "Stop use if irritation occurs and seek professional advice if needed",
        ],
      },
      {
        title: "Liability and updates",
        body:
          "We may update these terms as the store, products, checkout, or fulfilment process changes.",
        bullets: [
          "Website content, brand assets, images, and copy belong to UpDerma",
          "Our products do not replace medical diagnosis or treatment",
          "Pakistan law applies where relevant",
        ],
      },
    ],
    blocksUr: [
      {
        title: "ویب سائٹ کا استعمال",
        body:
          "ویب سائٹ استعمال کرنے یا آرڈر دینے سے آپ ان شرائط سے اتفاق کرتے ہیں۔",
      },
      {
        title: "آرڈر اور ادائیگی",
        body:
          "آرڈر COD منظوری یا ادائیگی کی تصدیق کے بعد کنفرم ہوتا ہے۔",
      },
      {
        title: "ڈیلیوری اور استعمال",
        body:
          "ڈیلیوری کا وقت شہر، کوریئر اور درست پتے پر منحصر ہے۔ پہلے پیچ ٹیسٹ کریں۔",
      },
      {
        title: "اپ ڈیٹس",
        body:
          "اسٹور، مصنوعات یا چیک آؤٹ میں تبدیلی کے ساتھ یہ شرائط اپ ڈیٹ ہو سکتی ہیں۔",
      },
    ],
  },
  "delivery-returns": {
    title: "Delivery & Returns",
    titleUr: "ڈیلیوری اور واپسی",
    eyebrow: "Delivery and support",
    summary:
      "Delivery coverage, tracking, payment-based stock reservation, returns, and support after checkout.",
    summaryUr:
      "چیک آؤٹ کے بعد ڈیلیوری کوریج، ٹریکنگ، ادائیگی کے مطابق اسٹاک ریزرویشن، واپسی، اور سپورٹ کی تفصیل۔",
    lastUpdated: "July 22, 2026",
    lastUpdatedUr: "22 جولائی 2026",
    blocks: [
      {
        title: "Delivery coverage",
        body:
          "We deliver across Pakistan through courier partners. Timelines vary by city, courier capacity, and address accuracy.",
        bullets: [
          "Major cities usually move faster than remote areas",
          "Correct phone number and address help avoid delays",
          "Tracking is shared when available after confirmation",
        ],
      },
      {
        title: "Shipping charges",
        body:
          "Shipping charges depend on checkout settings, payment method, promotions, and order value at the time of purchase.",
        bullets: [
          "Prepaid orders may qualify for free delivery or discounts",
          "COD fee is calculated at checkout",
          "Final total is shown before order submission",
        ],
      },
      {
        title: "Returns",
        body:
          "If there is an issue after delivery, contact support with your order number and product photos if relevant.",
        bullets: [
          "Keep original packaging where possible",
          "Return eligibility depends on verification and policy window",
          "Refund or replacement timelines depend on case approval",
        ],
      },
      {
        title: "Support",
        body:
          "For the fastest help, message support with your order number, phone number, and a clear description of the issue.",
      },
      {
        title: "Stock Reservation",
        body:
          "Prepaid orders are reserved when payment is verified. COD stock is reserved after WhatsApp or phone verification. Orders are fulfilled in confirmation order while stock remains available.",
      },
    ],
    blocksUr: [
      {
        title: "ڈیلیوری کوریج",
        body:
          "ہم پاکستان بھر میں کوریئر پارٹنرز کے ذریعے ڈیلیوری کرتے ہیں۔ وقت شہر اور پتے کے مطابق بدل سکتا ہے۔",
      },
      {
        title: "شپنگ چارجز",
        body:
          "شپنگ فیس چیک آؤٹ سیٹنگز، ادائیگی کے طریقے، آفرز اور آرڈر ویلیو کے مطابق لگتی ہے۔",
      },
      {
        title: "واپسی",
        body:
          "ڈیلیوری کے بعد مسئلہ ہو تو آرڈر نمبر اور تصاویر کے ساتھ سپورٹ سے رابطہ کریں۔",
      },
      {
        title: "سپورٹ",
        body:
          "تیز مدد کے لیے آرڈر نمبر، فون نمبر اور مسئلے کی واضح تفصیل بھیجیں۔",
      },
      {
        title: "اسٹاک ریزرویشن",
        body:
          "پری پیڈ آرڈر ادائیگی کی تصدیق پر محفوظ ہوتے ہیں۔ COD اسٹاک واٹس ایپ یا فون تصدیق کے بعد محفوظ ہوتا ہے۔ دستیاب اسٹاک میں آرڈر تصدیق کی ترتیب سے پورے کیے جاتے ہیں۔",
      },
    ],
  },
};
