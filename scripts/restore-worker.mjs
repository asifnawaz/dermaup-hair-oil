import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { gunzipSync } from "node:zlib";

const compressedPath = new URL("../dist/worker.js.gz", import.meta.url);
const outputPath = new URL("../dist/worker.js", import.meta.url);
const expectedCompressed =
  "15a15f65f903e220f9aa88c723a10aa02a91b27872cc97daa5330c82645270c1";
const expectedWorker =
  "6ba7e07d844a6f5d5900c79c8ca7712cc81c1344d13a793dc2f305b03735cfc4";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const compressed = await readFile(compressedPath);
if (sha256(compressed) !== expectedCompressed) {
  throw new Error("Recovered Worker gzip checksum does not match");
}

const worker = gunzipSync(compressed);
if (sha256(worker) !== expectedWorker) {
  throw new Error("Recovered Worker checksum does not match");
}

await mkdir(dirname(outputPath.pathname), { recursive: true });
await writeFile(outputPath, worker);

console.log(`Restored ${worker.length} bytes to dist/worker.js`);

