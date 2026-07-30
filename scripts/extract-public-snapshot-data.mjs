import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const snapshotRoot = path.join(root, "snapshot", "html");
const outputPath = path.join(
  root,
  "recovery",
  "source-reconstruction",
  "public-snapshot-data.json",
);
const reconstructionDataPath = path.join(
  root,
  "reconstructed-source",
  "data",
  "public-snapshot-data.json",
);

const allowedKeys = [
  "products",
  "allProducts",
  "product",
  "contentBlocks",
  "sections",
  "shippingConfig",
  "paymentMethodLabels",
];
const forbiddenKeyPattern =
  /(?:password|passwordHash|secret|token|jwt|adminSetupKey|customerEmail|customerPhone|customerName|address)/i;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)));
    } else if (entry.name === "index.html") {
      files.push(absolute);
    }
  }
  return files.sort();
}

function routeFromSnapshotPath(absolutePath) {
  const relative = path
    .relative(snapshotRoot, absolutePath)
    .split(path.sep)
    .join("/");
  const route = relative.replace(/(?:^|\/)index\.html$/, "");
  return route ? `/${route}` : "/";
}

function extractRscStream(html) {
  const chunks = [];
  for (const match of html.matchAll(
    /self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g,
  )) {
    const payload = JSON.parse(match[1]);
    if (payload[0] === 1 && typeof payload[1] === "string") {
      chunks.push(payload[1]);
    }
  }
  return chunks.join("");
}

function extractJsonValue(stream, key) {
  const marker = `${JSON.stringify(key)}:`;
  let start = stream.indexOf(marker);
  if (start < 0) {
    return undefined;
  }
  start += marker.length;

  const opener = stream[start];
  if (opener !== "{" && opener !== "[") {
    return undefined;
  }
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = start;

  for (; end < stream.length; end += 1) {
    const character = stream[end];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
    } else if (character === opener) {
      depth += 1;
    } else if (character === closer) {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  if (depth !== 0) {
    throw new Error(`Unbalanced JSON value for ${key}`);
  }
  return JSON.parse(stream.slice(start, end));
}

function assertPublicShape(value, trail = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertPublicShape(entry, [...trail, String(index)]),
    );
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeyPattern.test(key)) {
      throw new Error(
        `Refusing to export non-public key at ${[...trail, key].join(".")}`,
      );
    }
    assertPublicShape(child, [...trail, key]);
  }
}

const routes = [];
for (const absolutePath of await walk(snapshotRoot)) {
  const bytes = await readFile(absolutePath);
  const html = bytes.toString("utf8");
  const stream = extractRscStream(html);
  const data = {};

  for (const key of allowedKeys) {
    const value = extractJsonValue(stream, key);
    if (value !== undefined) {
      assertPublicShape(value, [key]);
      data[key] = value;
    }
  }

  routes.push({
    route: routeFromSnapshotPath(absolutePath),
    snapshotPath: path
      .relative(root, absolutePath)
      .split(path.sep)
      .join("/"),
    snapshotBytes: bytes.length,
    snapshotSha256: sha256(bytes),
    rscBytes: Buffer.byteLength(stream),
    data,
  });
}

const output = {
  formatVersion: 1,
  evidenceType: "public-render-snapshot",
  notice: [
    "This file contains only data already rendered on public UpDerma routes.",
    "It intentionally excludes site settings, credentials, customer records, orders, subscribers, analytics, email logs, and payment-account details.",
  ],
  routes,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(reconstructionDataPath), { recursive: true });
const outputText = `${JSON.stringify(output, null, 2)}\n`;
await writeFile(outputPath, outputText);
await writeFile(reconstructionDataPath, outputText);

console.log(
  JSON.stringify(
    {
      output: path.relative(root, outputPath),
      reconstructionData: path.relative(root, reconstructionDataPath),
      routes: routes.length,
      routesWithProducts: routes.filter(
        (route) => Array.isArray(route.data.products),
      ).length,
      productPages: routes.filter(
        (route) => route.data.product && !Array.isArray(route.data.product),
      ).length,
      sectionSets: routes.filter(
        (route) => Array.isArray(route.data.sections),
      ).length,
    },
    null,
    2,
  ),
);
