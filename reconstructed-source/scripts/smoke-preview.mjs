import { randomUUID } from "node:crypto";

const baseUrl = new URL(
  process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000",
);
const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;

if (process.env.SMOKE_MUTATIONS_ACK !== "preview-only") {
  throw new Error(
    "Set SMOKE_MUTATIONS_ACK=preview-only to confirm this test may create synthetic preview records.",
  );
}

if (
  baseUrl.hostname === "upderma.com" ||
  baseUrl.hostname === "www.upderma.com"
) {
  throw new Error("The smoke test refuses to write to the production hostname.");
}

if (!adminEmail || !adminPassword) {
  throw new Error("SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD are required.");
}

let token = "";

async function request(
  pathname,
  {
    method = "GET",
    body,
    authenticated = true,
    expectStatus,
  } = {},
) {
  const headers = new Headers();
  if (body !== undefined) headers.set("content-type", "application/json");
  if (authenticated && token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(new URL(pathname, baseUrl), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (
    (expectStatus !== undefined && response.status !== expectStatus) ||
    (expectStatus === undefined && !response.ok)
  ) {
    throw new Error(
      `${method} ${pathname} returned ${response.status}: ${text.slice(0, 300)}`,
    );
  }

  return { data, headers: response.headers, status: response.status };
}

const login = await request("/api/admin/auth/login", {
  authenticated: false,
  method: "POST",
  body: { email: adminEmail, password: adminPassword },
  expectStatus: 200,
});

if (!login.data?.success || !login.data?.data?.token) {
  throw new Error("Preview admin login did not return a token.");
}
token = login.data.data.token;

const suffix = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
const couponCode = `REC${suffix}`;
const phone = `03${String(Date.now() % 1_000_000_000).padStart(9, "0")}`;
const syntheticEmail = `recovery-smoke-${suffix.toLowerCase()}@example.invalid`;

const authenticatedApiRoutes = [
  "/api/admin/auth/me",
  "/api/admin/dashboard/stats",
  "/api/admin/content/products",
  "/api/admin/content/pages",
  "/api/admin/content/blocks",
  "/api/admin/coupons",
  "/api/admin/orders",
  "/api/admin/customers",
  "/api/admin/subscribers",
  "/api/admin/users",
  "/api/admin/analytics",
  "/api/admin/media",
];

for (const pathname of authenticatedApiRoutes) {
  const response = await request(pathname);
  if (response.data?.success !== true) {
    throw new Error(`${pathname} did not return success=true.`);
  }
}

await request("/api/admin/coupons", {
  method: "POST",
  body: {
    code: couponCode,
    type: "percentage",
    value: 10,
    minOrder: 0,
    maxUses: 5,
    appliesTo: "all",
    active: true,
  },
  expectStatus: 201,
});

const coupon = await request("/api/coupons/validate", {
  authenticated: false,
  method: "POST",
  body: { code: couponCode, subtotal: 3499 },
});
if (!coupon.data?.success || coupon.data?.data?.discount !== 350) {
  throw new Error("Coupon validation returned an unexpected discount.");
}

const created = await request("/api/orders", {
  authenticated: false,
  method: "POST",
  body: {
    customerName: "Recovery Test Customer",
    customerEmail: syntheticEmail,
    customerPhone: phone,
    city: "Islamabad",
    address: "123 Recovery Preview Street, Test Area",
    paymentMethod: "cod",
    language: "en",
    couponCode,
    items: [
      {
        productId: process.env.SMOKE_PRODUCT_ID || "prod_hair_oil",
        packageType: process.env.SMOKE_PACKAGE_TYPE || "single",
        quantity: 1,
      },
    ],
  },
});
if (!created.data?.success) throw new Error("Synthetic order creation failed.");

const listed = await request(
  `/api/admin/orders?search=${encodeURIComponent(phone)}`,
);
const internalOrderId = listed.data?.data?.orders?.[0]?.id;
if (!internalOrderId) throw new Error("Synthetic order was not found in admin.");

const detail = await request(`/api/admin/orders/${internalOrderId}`);
if (detail.data?.data?.items?.length !== 1) {
  throw new Error("Synthetic order detail did not contain its line item.");
}

const verified = await request(
  `/api/admin/orders/${internalOrderId}/verify`,
  { method: "POST" },
);
if (verified.data?.data?.order?.paymentStatus !== "verified") {
  throw new Error("Payment verification did not persist.");
}

const shipped = await request(`/api/admin/orders/${internalOrderId}/ship`, {
  method: "POST",
  body: {
    courierName: "Recovery Test Courier",
    trackingNumber: `RECOVERY-${suffix}`,
    trackingUrl: `https://example.invalid/track/${suffix}`,
    expectedDeliveryDate: "2026-08-05",
  },
});
if (shipped.data?.data?.order?.orderStatus !== "shipped") {
  throw new Error("Shipping transition did not persist.");
}

const cookieHeaders = {
  cookie: `admin_token=${token}`,
};
const backofficeRoutes = [
  "/backoffice/dashboard",
  "/backoffice/orders",
  `/backoffice/orders/${internalOrderId}`,
  "/backoffice/customers",
  `/backoffice/customers/${encodeURIComponent(phone)}`,
  "/backoffice/subscribers",
  "/backoffice/users",
  "/backoffice/analytics",
  "/backoffice/media",
  "/backoffice/content",
  "/backoffice/content/products",
  "/backoffice/content/pages",
  "/backoffice/content/blocks",
  "/backoffice/coupons",
  "/backoffice/settings",
];

for (const pathname of backofficeRoutes) {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers: cookieHeaders,
    redirect: "manual",
  });
  if (response.status !== 200) {
    throw new Error(`GET ${pathname} returned ${response.status}.`);
  }
}

console.log(
  JSON.stringify(
    {
      success: true,
      baseUrl: baseUrl.origin,
      authenticatedApiRoutes: authenticatedApiRoutes.length,
      backofficeRoutes: backofficeRoutes.length,
      couponDiscount: coupon.data.data.discount,
      orderNumber: created.data.data.orderNumber,
      orderTotal: created.data.data.total,
      paymentStatus: verified.data.data.order.paymentStatus,
      orderStatus: shipped.data.data.order.orderStatus,
      outboundEmailSent: Boolean(shipped.data.data.emailSent),
    },
    null,
    2,
  ),
);
