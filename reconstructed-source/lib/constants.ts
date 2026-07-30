/**
 * RECONSTRUCTED SOURCE
 *
 * Public constants recovered from the source index and deployed client bundle.
 * Product prices are read from the CMS; the legacy PRODUCT/PACKAGES exports are
 * retained for compatibility with older components.
 */

export const PRODUCT = {
  id: "prod_hair_oil",
  slug: "hair-growth-oil",
  name: "Bio-Activin Hair Growth Oil Serum",
  nameUr: "بائیو ایکٹیوِن ہیئر گروتھ آئل سیرم",
} as const;

export const PACKAGES = {
  single: {
    id: "single",
    name: "1 Bottle",
    nameUr: "ایک بوتل",
    bottles: 1,
    price: 3499,
    originalPrice: 3499,
  },
} as const;

export type PackageId = keyof typeof PACKAGES;

export const DELIVERY_FEE = 200;

export const PAYMENT_METHODS = {
  cod: {
    id: "cod",
    name: "Cash on Delivery",
    nameUr: "کیش آن ڈیلیوری",
  },
  easypaisa: {
    id: "easypaisa",
    name: "EasyPaisa / JazzCash",
    nameUr: "ایزی پیسہ / جاز کیش",
  },
  bank: {
    id: "bank",
    name: "Bank Transfer",
    nameUr: "بینک ٹرانسفر",
  },
} as const;

export type PaymentMethodId = keyof typeof PAYMENT_METHODS;

export const PAYMENT_DETAILS = {
  easypaisa: {},
  bank: {},
} as const;

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Jhang",
  "Rahim Yar Khan",
  "Gujrat",
  "Mardan",
  "Kasur",
  "Dera Ghazi Khan",
  "Sahiwal",
  "Nawabshah",
  "Mingora",
  "Okara",
  "Mirpur",
  "Chiniot",
  "Kamoke",
  "Mandi Bahauddin",
  "Jhelum",
  "Sadiqabad",
  "Jacobabad",
  "Shikarpur",
  "Khanewal",
  "Hafizabad",
  "Kohat",
  "Muzaffargarh",
  "Khanpur",
  "Gojra",
  "Bahawalnagar",
  "Abbottabad",
  "Other",
] as const;

export const COURIERS = ["TCS", "Leopards", "M&P", "PostEx", "Other"] as const;

export const LANGUAGES = ["en", "ur"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
