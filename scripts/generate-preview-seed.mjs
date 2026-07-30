import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const inputPath = path.join(
  root,
  "reconstructed-source",
  "data",
  "public-snapshot-data.json",
);
const outputPath = path.join(
  root,
  "reconstructed-source",
  "migrations",
  "0003_public_preview_seed.sql",
);

const snapshot = JSON.parse(await readFile(inputPath, "utf8"));
const routes = snapshot.routes;

function sqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`Cannot serialize non-finite SQL number: ${value}`);
    }
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insert(table, columns, values) {
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values
    .map(sqlValue)
    .join(", ")});`;
}

const productRoutes = routes.filter(
  ({ data }) => data.product && !Array.isArray(data.product),
);
const products = productRoutes
  .map(({ data }) => data.product)
  .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

if (products.length !== 4) {
  throw new Error(`Expected four public products, found ${products.length}`);
}

const sectionMap = new Map();
for (const route of routes) {
  for (const section of route.data.sections || []) {
    const normalized = {
      ...section,
      config: JSON.stringify(section.parsedConfig ?? {}),
    };
    delete normalized.parsedConfig;

    const existing = sectionMap.get(normalized.id);
    if (
      existing &&
      JSON.stringify(existing) !== JSON.stringify(normalized)
    ) {
      throw new Error(`Conflicting public section data for ${normalized.id}`);
    }
    sectionMap.set(normalized.id, normalized);
  }
}
const sections = [...sectionMap.values()].sort(
  (a, b) =>
    a.pageId.localeCompare(b.pageId) ||
    a.sortOrder - b.sortOrder ||
    a.id.localeCompare(b.id),
);

const contentBlockMap = new Map();
for (const route of routes) {
  for (const block of route.data.contentBlocks || []) {
    const normalized = {
      ...block,
      data: JSON.stringify(block.parsedData ?? {}),
    };
    delete normalized.parsedData;

    const existing = contentBlockMap.get(normalized.id);
    if (
      existing &&
      JSON.stringify(existing) !== JSON.stringify(normalized)
    ) {
      throw new Error(`Conflicting public content block data for ${normalized.id}`);
    }
    contentBlockMap.set(normalized.id, normalized);
  }
}
const contentBlocks = [...contentBlockMap.values()].sort(
  (a, b) =>
    String(a.productId).localeCompare(String(b.productId)) ||
    a.type.localeCompare(b.type) ||
    a.sortOrder - b.sortOrder ||
    a.id.localeCompare(b.id),
);

const pageMap = new Map();
for (const route of routes.filter(({ data }) => data.sections?.length)) {
  const firstSection = route.data.sections[0];
  const product = route.data.product;
  const isProduct = Boolean(product && !Array.isArray(product));
  const isHome = route.route === "/";
  const slug = isHome
    ? "home"
    : isProduct
      ? product.slug
      : route.route.replace(/^\//, "");
  const title = isHome
    ? "UpDerma Storefront"
    : isProduct
      ? product.name
      : firstSection.parsedConfig?.title || slug;

  pageMap.set(firstSection.pageId, {
    id: firstSection.pageId,
    slug,
    productId: isProduct ? product.id : null,
    title,
    type: isProduct ? "product" : "page",
    meta: "{}",
    active: true,
    createdAt:
      product?.createdAt || firstSection.createdAt || "2026-07-30 00:00:00",
    updatedAt:
      product?.updatedAt || firstSection.createdAt || "2026-07-30 00:00:00",
  });
}
const pages = [...pageMap.values()].sort((a, b) => a.id.localeCompare(b.id));

if (
  pages.length !== 9 ||
  sections.length !== 53 ||
  contentBlocks.length !== 133
) {
  throw new Error(
    `Unexpected public seed shape: ${pages.length} pages, ${sections.length} sections, ${contentBlocks.length} content blocks`,
  );
}

const siteSettings = {
  contact: {
    whatsappNumber: "923001234567",
    whatsappDisplay: "0300-1234567",
    email: "support@upderma.com",
    businessName: "UpDerma Pvt Ltd",
    showFloatingButton: true,
  },
  promo_banner: {
    textEn: "Complimentary delivery on prepaid orders across Pakistan",
    textUr: "پاکستان بھر میں پری پیڈ آرڈرز پر مفت ڈیلیوری",
  },
  checkout_config: {
    codDeliveryFee: 200,
    freeShippingThreshold: 5000,
    prepaidDiscountPercent: 10,
    autoApplyCoupon: "",
  },
  payment_methods: {
    cod: {
      id: "cod",
      name: "Cash on Delivery",
      nameUr: "کیش آن ڈیلیوری",
      description: "Pay when you receive",
      descriptionUr: "موصول ہونے پر ادائیگی کریں",
      deliveryFee: 200,
      requiresVerification: false,
    },
    easypaisa: {
      id: "easypaisa",
      name: "EasyPaisa / JazzCash",
      nameUr: "ایزی پیسہ / جاز کیش",
      description: "Order first, get wallet details next",
      descriptionUr: "پہلے آرڈر کریں، پھر والیٹ تفصیلات دیکھیں",
      deliveryFee: 0,
      requiresVerification: true,
    },
    bank: {
      id: "bank",
      name: "Bank Transfer",
      nameUr: "بینک ٹرانسفر",
      description: "Order first, get bank details next",
      descriptionUr: "پہلے آرڈر کریں، پھر بینک تفصیلات دیکھیں",
      deliveryFee: 0,
      requiresVerification: true,
    },
  },
  // Intentionally empty. Production payment-account details are private and
  // are neither needed for visual parity nor safe to copy into the preview.
  payment_details: {},
};

const statements = [
  "-- Generated only from data rendered on public UpDerma pages.",
  "-- No production orders, customers, subscribers, analytics, credentials,",
  "-- email logs, admin users, or payment-account details are included.",
  "BEGIN TRANSACTION;",
];

for (const product of products) {
  statements.push(
    insert(
      "products",
      [
        "id",
        "slug",
        "name",
        "name_ur",
        "sku",
        "category",
        "short_description",
        "short_description_ur",
        "image_url",
        "badge",
        "badge_ur",
        "data",
        "active",
        "sort_order",
        "created_at",
        "updated_at",
      ],
      [
        product.id,
        product.slug,
        product.name,
        product.nameUr,
        product.sku,
        product.category,
        product.shortDescription,
        product.shortDescriptionUr,
        product.imageUrl,
        product.badge,
        product.badgeUr,
        JSON.stringify(product.parsedData ?? {}),
        product.active,
        product.sortOrder,
        product.createdAt,
        product.updatedAt,
      ],
    ),
  );
}

for (const block of contentBlocks) {
  statements.push(
    insert(
      "content_blocks",
      [
        "id",
        "type",
        "slug",
        "product_id",
        "data",
        "active",
        "sort_order",
        "created_at",
        "updated_at",
      ],
      [
        block.id,
        block.type,
        block.slug,
        block.productId,
        block.data,
        block.active,
        block.sortOrder,
        block.createdAt,
        block.updatedAt,
      ],
    ),
  );
}

for (const page of pages) {
  statements.push(
    insert(
      "pages",
      [
        "id",
        "slug",
        "product_id",
        "title",
        "type",
        "meta",
        "active",
        "created_at",
        "updated_at",
      ],
      [
        page.id,
        page.slug,
        page.productId,
        page.title,
        page.type,
        page.meta,
        page.active,
        page.createdAt,
        page.updatedAt,
      ],
    ),
  );
}

for (const section of sections) {
  statements.push(
    insert(
      "page_sections",
      [
        "id",
        "page_id",
        "section_type",
        "sort_order",
        "config",
        "active",
        "created_at",
      ],
      [
        section.id,
        section.pageId,
        section.sectionType,
        section.sortOrder,
        section.config,
        section.active,
        section.createdAt,
      ],
    ),
  );
}

for (const [key, value] of Object.entries(siteSettings)) {
  statements.push(
    insert(
      "site_settings",
      ["key", "value", "updated_at"],
      [key, JSON.stringify(value), "2026-07-30 00:00:00"],
    ),
  );
}

statements.push("COMMIT;", "");
const output = statements.join("\n");

if (
  /(?:password_hash|admin_setup_key|customer_phone|customer_email|recipient_email|account_number)/i.test(
    output,
  )
) {
  throw new Error("Refusing to write private data into the public preview seed");
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);

console.log(
  JSON.stringify(
    {
      output: path.relative(root, outputPath),
      products: products.length,
      contentBlocks: contentBlocks.length,
      pages: pages.length,
      sections: sections.length,
      siteSettings: Object.keys(siteSettings).length,
    },
    null,
    2,
  ),
);
