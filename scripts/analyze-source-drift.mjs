import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const indexRoot = path.join(root, "recovery", "original-codebase-index");
const outputRoot = path.join(root, "recovery", "source-reconstruction");

const inventory = (
  await readFile(path.join(indexRoot, "FILE-INVENTORY.tsv"), "utf8")
)
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((row) => row.split("\t")[0]);
const routeInventory = JSON.parse(
  await readFile(path.join(root, "recovery", "route-inventory.json"), "utf8"),
);
const worker = await readFile(path.join(root, "dist", "worker.js"), "utf8");

const sourceRoot = "/home/asifnawaz/git/dermaup-hair-oil/";
const pathPattern =
  /\/home\/asifnawaz\/git\/dermaup-hair-oil\/([^"'?\s}]+)/g;
const deployedPathEvidence = new Set();

for (const match of worker.matchAll(pathPattern)) {
  const relativePath = match[1].replaceAll("\\/", "/");
  if (
    relativePath.startsWith("node_modules/") ||
    relativePath.startsWith(".next/")
  ) {
    continue;
  }
  deployedPathEvidence.add(relativePath);
}

const indexedApiRoutes = inventory.filter(
  (entry) =>
    (entry.startsWith("app/api/") || entry === "app/favicon.ico/route.ts") &&
    entry.endsWith("/route.ts"),
);
const deployedApiRoutes = routeInventory.apiSourceFiles;
const indexedApiSet = new Set(indexedApiRoutes);
const deployedApiSet = new Set(deployedApiRoutes);

const knownPathMigrations = [
  {
    fromPrefix: "app/admin/",
    toPrefix: "app/backoffice/",
    reason: "The live build exposes the administrative UI at /backoffice.",
  },
  {
    fromPrefix: "app/(site)/checkout/",
    toPrefix: "app/(checkout)/checkout/",
    reason:
      "The live build moved checkout into a dedicated App Router route group.",
  },
];

const migratedPaths = [];
for (const indexedPath of inventory) {
  for (const migration of knownPathMigrations) {
    if (!indexedPath.startsWith(migration.fromPrefix)) {
      continue;
    }
    const candidate =
      migration.toPrefix + indexedPath.slice(migration.fromPrefix.length);
    if (deployedPathEvidence.has(candidate)) {
      migratedPaths.push({
        indexedPath,
        deployedPath: candidate,
        reason: migration.reason,
      });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  evidenceRevisions: {
    indexedLocalHead: "0eed85e378fd65c75eaf90b9588a85d11de9f523",
    indexedAt: "2026-07-22T01:28:00Z",
    deployedWorkerVersion: routeInventory.frozenVersion,
    deployedBuildId: routeInventory.buildId,
    relationship:
      "No cryptographic link proves that the local-only HEAD and deployed Worker are identical. The deployment was produced later the same day and contains observable path drift.",
  },
  sourceRoot,
  counts: {
    indexedPaths: inventory.length,
    deployedSourcePathsObservedInManifests: deployedPathEvidence.size,
    indexedApiRoutes: indexedApiRoutes.length,
    deployedApiRoutes: deployedApiRoutes.length,
    unchangedApiRoutes: deployedApiRoutes.filter((entry) =>
      indexedApiSet.has(entry),
    ).length,
    newDeployedApiRoutes: deployedApiRoutes.filter(
      (entry) => !indexedApiSet.has(entry),
    ).length,
    indexedApiRoutesNotObserved: indexedApiRoutes.filter(
      (entry) => !deployedApiSet.has(entry),
    ).length,
    knownMigratedPaths: migratedPaths.length,
  },
  apiRoutes: {
    unchanged: deployedApiRoutes.filter((entry) => indexedApiSet.has(entry)),
    addedInDeployedEvidence: deployedApiRoutes.filter(
      (entry) => !indexedApiSet.has(entry),
    ),
    indexedButNotObservedInDeployment: indexedApiRoutes.filter(
      (entry) => !deployedApiSet.has(entry),
    ),
  },
  knownPathMigrations: migratedPaths,
  deployedSourcePathsObservedInManifests: [...deployedPathEvidence].sort(),
  interpretation: [
    "FILE-INVENTORY.tsv is authoritative for the 219 files indexed at the local-only Git HEAD.",
    "The Worker manifests are authoritative for paths observed in the later deployed build.",
    "Absence from a Worker manifest does not prove that a source file was deleted because server-only and inlined modules are not always named there.",
    "Reconstruction should prefer deployed behavior while retaining the local index as provenance and naming evidence.",
  ],
};

await mkdir(outputRoot, { recursive: true });
await writeFile(
  path.join(outputRoot, "source-drift.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      output: "recovery/source-reconstruction/source-drift.json",
      counts: report.counts,
      addedApiRoutes: report.apiRoutes.addedInDeployedEvidence,
    },
    null,
    2,
  ),
);
