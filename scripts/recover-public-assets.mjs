import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const baseUrl = "https://upderma.com";
const recoveryRoot = new URL("../", import.meta.url).pathname;
const workerPath = join(recoveryRoot, "raw", "worker.js");
const publicRoot = join(recoveryRoot, "public");
const snapshotRoot = join(recoveryRoot, "snapshot", "html");

const pageRoutes = [
  "/",
  "/products",
  "/products/hair-growth-oil",
  "/products/glass-glow-serum",
  "/products/rice-glow-cream",
  "/products/rice-renew-cream",
  "/delivery-returns",
  "/refund",
  "/privacy",
  "/terms",
  "/checkout",
  "/backoffice/login",
];

const worker = await readFile(workerPath, "utf8");
const staticAssetPattern =
  /static\/(?:chunks|css|media)\/[^"'`\s\\]+/g;
const assetPaths = new Set(
  [...worker.matchAll(staticAssetPattern)].map(
    ([path]) => `/_next/${path}`,
  ),
);

const fetchedPages = [];
for (const route of pageRoutes) {
  const response = await fetch(new URL(route, baseUrl), {
    redirect: "follow",
    headers: { "user-agent": "UpDerma owner recovery/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Unable to recover ${route}: HTTP ${response.status}`);
  }

  const html = await response.text();
  const snapshotPath =
    route === "/"
      ? join(snapshotRoot, "index.html")
      : join(snapshotRoot, route.slice(1), "index.html");
  await mkdir(dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, html);
  fetchedPages.push({ route, bytes: Buffer.byteLength(html) });

  for (const match of html.matchAll(
    /(?:src|href)=["'](\/[^"'?#]+\.(?:js|css|woff2?|png|webp|svg|ico|jpe?g|gif|avif))(?:[?#][^"']*)?["']/gi,
  )) {
    assetPaths.add(match[1]);
  }
}

const failures = [];
let recoveredBytes = 0;
let recoveredFiles = 0;
const canonicalAssets = new Map();
for (const path of assetPaths) {
  const url = new URL(path, baseUrl);
  if (url.pathname.startsWith("/cdn-cgi/")) {
    continue;
  }
  const decodedPath = decodeURIComponent(url.pathname);
  canonicalAssets.set(decodedPath, path);
}
const queue = [...canonicalAssets.values()].sort();
const concurrency = 8;

async function recoverAsset(path) {
  const url = new URL(path, baseUrl);
  const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const destination = join(publicRoot, decodedPath);
  try {
    const existing = await stat(destination);
    if (existing.size > 0) {
      recoveredBytes += existing.size;
      recoveredFiles += 1;
      return;
    }
  } catch {
    // Missing files are recovered from the live deployment below.
  }

  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "UpDerma owner recovery/1.0" },
  });

  if (!response.ok) {
    failures.push({ path, status: response.status });
    return;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  recoveredBytes += bytes.length;
  recoveredFiles += 1;
}

for (let index = 0; index < queue.length; index += concurrency) {
  await Promise.all(queue.slice(index, index + concurrency).map(recoverAsset));
}

const report = {
  recoveredAt: new Date().toISOString(),
  source: baseUrl,
  frozenWorkerVersion: "07fa0712-d8ac-48b7-bc06-7be615555184",
  pages: fetchedPages,
  requestedAssets: queue.length,
  recoveredFiles,
  recoveredBytes,
  failures,
};

await writeFile(
  join(recoveryRoot, "snapshot", "public-assets-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(JSON.stringify(report, null, 2));
