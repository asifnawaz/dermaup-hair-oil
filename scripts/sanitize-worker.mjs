import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const root = new URL("../", import.meta.url).pathname;
const rawWorkerPath = join(root, "raw", "worker.js");
const sanitizedWorkerPath = join(root, "dist", "worker.js");
const compressedWorkerPath = join(root, "dist", "worker.js.gz");

const secretPatterns = [
  {
    name: "cloudflare_api_token",
    regex: /cfut_[A-Za-z0-9]{20,}/g,
    replacement: "__REDACTED_CLOUDFLARE_API_TOKEN__",
  },
  {
    name: "openai_api_key",
    regex: /(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}/g,
  },
  {
    name: "github_token",
    regex: /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  },
  {
    name: "aws_access_key",
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: "google_api_key",
    regex: /AIza[0-9A-Za-z_-]{30,}/g,
  },
  {
    name: "resend_api_key",
    regex: /\bre_[A-Za-z0-9]{20,}\b/g,
  },
  {
    name: "private_key",
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const rawWorker = await readFile(rawWorkerPath, "utf8");
const rawSha256 = sha256(rawWorker);
let sanitizedWorker = rawWorker;
const replacements = [];

for (const pattern of secretPatterns) {
  const matches = sanitizedWorker.match(pattern.regex) ?? [];
  if (matches.length === 0) {
    continue;
  }
  if (!pattern.replacement) {
    throw new Error(
      `Refusing to publish: ${pattern.name} appears ${matches.length} time(s)`,
    );
  }
  sanitizedWorker = sanitizedWorker.replaceAll(
    pattern.regex,
    pattern.replacement,
  );
  replacements.push({ pattern: pattern.name, count: matches.length });
}

await mkdir(dirname(sanitizedWorkerPath), { recursive: true });
await writeFile(sanitizedWorkerPath, sanitizedWorker);
await writeFile(
  compressedWorkerPath,
  gzipSync(Buffer.from(sanitizedWorker), { level: 9 }),
);

const scanRoots = [
  sanitizedWorkerPath,
  join(root, "public"),
  join(root, "snapshot"),
  join(root, "migrations"),
  join(root, "recovery"),
];
const findings = [];

async function scanPath(path) {
  const metadata = await stat(path);
  if (metadata.isDirectory()) {
    for (const entry of await readdir(path)) {
      await scanPath(join(path, entry));
    }
    return;
  }

  const bytes = await readFile(path);
  const text = bytes.toString("utf8");
  for (const pattern of secretPatterns) {
    const matches = text.match(pattern.regex) ?? [];
    if (matches.length > 0) {
      findings.push({
        path: relative(root, path),
        pattern: pattern.name,
        count: matches.length,
      });
    }
  }
}

for (const path of scanRoots) {
  await scanPath(path);
}

if (findings.length > 0) {
  throw new Error(
    `Refusing to publish because secret-like values remain: ${JSON.stringify(findings)}`,
  );
}

const report = {
  auditedAt: new Date().toISOString(),
  sourceWorker: {
    cloudflareVersion: "07fa0712-d8ac-48b7-bc06-7be615555184",
    bytes: Buffer.byteLength(rawWorker),
    sha256: rawSha256,
    published: false,
  },
  sanitizedWorker: {
    bytes: Buffer.byteLength(sanitizedWorker),
    sha256: sha256(sanitizedWorker),
    gzipBytes: (await stat(compressedWorkerPath)).size,
    gzipSha256: sha256(await readFile(compressedWorkerPath)),
  },
  replacements,
  remainingSecretFindings: findings,
  excludedDataClasses: [
    "admin credentials and password hashes",
    "analytics events",
    "customer names, email addresses, phone numbers, and addresses",
    "email logs",
    "orders and order activity",
    "subscribers",
  ],
};

await writeFile(
  join(root, "recovery", "security-audit.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(JSON.stringify(report, null, 2));
