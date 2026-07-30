import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const root = new URL("../", import.meta.url);
const expectedCompressed =
  "15a15f65f903e220f9aa88c723a10aa02a91b27872cc97daa5330c82645270c1";
const expectedWorker =
  "6ba7e07d844a6f5d5900c79c8ca7712cc81c1344d13a793dc2f305b03735cfc4";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function countFiles(url) {
  const entries = await readdir(url, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.name === "cdn-cgi") {
      continue;
    }
    count += entry.isDirectory()
      ? await countFiles(new URL(`${entry.name}/`, url))
      : 1;
  }
  return count;
}

const compressed = await readFile(new URL("dist/worker.js.gz", root));
const worker = gunzipSync(compressed);
const routeInventory = JSON.parse(
  await readFile(new URL("recovery/route-inventory.json", root), "utf8"),
);
const assetReport = JSON.parse(
  await readFile(
    new URL("snapshot/public-assets-report.json", root),
    "utf8",
  ),
);
const securityAudit = JSON.parse(
  await readFile(new URL("recovery/security-audit.json", root), "utf8"),
);

const checks = {
  compressedChecksum: sha256(compressed) === expectedCompressed,
  workerChecksum: sha256(worker) === expectedWorker,
  recoveredAssets:
    assetReport.recoveredFiles === 271 &&
    (await countFiles(new URL("public/", root))) === 272,
  failedAssets: assetReport.failures.length === 0,
  routePathnames: routeInventory.routePathnames.length === 79,
  apiSourcePaths: routeInventory.apiSourceFiles.length === 40,
  staticManifestEntries: routeInventory.staticAssets.length === 194,
  remainingSecretFindings:
    securityAudit.remainingSecretFindings.length === 0,
};

if (Object.values(checks).some((passed) => !passed)) {
  console.error(JSON.stringify(checks, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(checks, null, 2));
}
