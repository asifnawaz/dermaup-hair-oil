import { HomepageClient } from "./homepage-client";

import publicSnapshot from "@/data/public-snapshot-data.json";
import {
  getCachedAllProducts,
  getCachedContentBlocks,
  getCachedPageWithSections,
  getCachedSettings,
  parseTestimonials,
  type ParsedPageSection,
  type ParsedProduct,
  type Testimonial,
} from "@/lib/content";
import { getD1, getDb } from "@/lib/db";
import { CONTENT_BLOCK_TYPES } from "@/lib/db/schema";
import { buildHomepageViewModel } from "@/lib/homepage-view-model";
import { getTranslations } from "@/lib/i18n";
import { getLanguage } from "@/lib/language";
import {
  getDefaultStorefrontSettings,
  getStoreWhatsAppLinks,
  normalizeStorefrontSettings,
} from "@/lib/store-settings";

const fallbackProductsRoute = publicSnapshot.routes.find(
  (route) => route.route === "/products",
);
const fallbackHomepageRoute = publicSnapshot.routes.find(
  (route) => route.route === "/",
);

const FALLBACK_PRODUCTS =
  (fallbackProductsRoute?.data.products as unknown as ParsedProduct[]) || [];
const FALLBACK_SECTIONS =
  (fallbackHomepageRoute?.data.sections as unknown as ParsedPageSection[]) || [];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    slug: "homepage-ahmad-k",
    name: "Ahmad K.",
    nameUr: "",
    city: "Karachi",
    cityUr: "",
    age: 0,
    rating: 5,
    text:
      "I use it for my hairline and crown routine. The imported cold-pressed oil feels much cleaner than heavy full-head oiling.",
    textUr: "",
    verified: true,
  },
  {
    slug: "homepage-sana-a",
    name: "Sana A.",
    nameUr: "",
    city: "Karachi",
    cityUr: "",
    age: 0,
    rating: 5,
    text:
      "Karachi heat made my skin look dull and patchy. Rice Glow feels lightweight, and after a few weeks my skin looked fresher and more even.",
    textUr: "",
    verified: true,
  },
  {
    slug: "homepage-sara-k",
    name: "Sara K., Lahore",
    nameUr: "",
    city: "Lahore",
    cityUr: "",
    age: 0,
    rating: 5,
    text:
      "Pehle hafte halki peeling hui. I won't lie, I panicked. But my cousin who recommended it said 'ruk ja, yehi kaam hai.' By week two, meri skin ka texture hi change ho gaya tha. Itna soft. Ab imported wapis nahi ja rahi.",
    textUr: "",
    verified: true,
  },
  {
    slug: "homepage-hira-n",
    name: "Hira N.",
    nameUr: "",
    city: "",
    cityUr: "",
    age: 0,
    rating: 5,
    text:
      "It feels light under my cream and gives my skin a fresher glow without feeling sticky.",
    textUr: "",
    verified: true,
  },
];

export default async function Homepage() {
  const lang = await getLanguage();
  const translations = getTranslations(lang);
  const d1 = getD1();

  let products = FALLBACK_PRODUCTS;
  let testimonials = FALLBACK_TESTIMONIALS;
  let siteSettings: Record<string, unknown> = {};
  let sections = FALLBACK_SECTIONS;

  if (d1) {
    const db = getDb(d1);
    const [settings, databaseProducts, testimonialBlocks, page] =
      await Promise.all([
        getCachedSettings(db),
        getCachedAllProducts(db),
        getCachedContentBlocks(db, CONTENT_BLOCK_TYPES.TESTIMONIAL),
        getCachedPageWithSections(db, "storefront-home"),
      ]);
    siteSettings = settings;
    products = databaseProducts;
    testimonials = parseTestimonials(testimonialBlocks);
    sections = page?.sections || [];
  }

  const storefrontSettings = d1
    ? normalizeStorefrontSettings(siteSettings)
    : getDefaultStorefrontSettings();
  const whatsappUrl = getStoreWhatsAppLinks(
    storefrontSettings.contact,
  ).general;
  const viewModel = buildHomepageViewModel({
    lang,
    products,
    testimonials,
    siteSettings,
    homepageCopy: translations.homepage,
    catalogCopy: translations.productsCatalog,
    whatsappUrl,
  });

  return <HomepageClient viewModel={viewModel} sections={sections} />;
}
