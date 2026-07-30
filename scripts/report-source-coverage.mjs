import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const indexRoot = path.join(root, "recovery", "original-codebase-index");
const reconstructionRoot = path.join(root, "reconstructed-source");
const reportRoot = path.join(root, "recovery", "source-reconstruction");

function deployedEquivalent(indexedPath) {
  if (indexedPath.startsWith("app/admin/")) {
    return `app/backoffice/${indexedPath.slice("app/admin/".length)}`;
  }
  if (indexedPath.startsWith("app/(site)/checkout/")) {
    return `app/(checkout)/checkout/${indexedPath.slice(
      "app/(site)/checkout/".length,
    )}`;
  }
  return indexedPath;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory, prefix = "") {
  if (!(await exists(directory))) {
    return [];
  }
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      new Set(["node_modules", ".next", ".open-next", ".wrangler"]).has(
        entry.name,
      )
    ) {
      continue;
    }
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(directory, entry.name), relative)));
    } else {
      files.push(relative);
    }
  }
  return files;
}

const inventoryRows = (
  await readFile(path.join(indexRoot, "FILE-INVENTORY.tsv"), "utf8")
)
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((row) => {
    const [indexedPath, bytes, mtimeNs] = row.split("\t");
    return {
      indexedPath,
      indexedBytes: Number(bytes),
      indexedMtimeNs: mtimeNs,
    };
  });
const moduleCandidates = JSON.parse(
  await readFile(
    path.join(reportRoot, "server-module-candidates.json"),
    "utf8",
  ),
);
const routeInventory = JSON.parse(
  await readFile(path.join(root, "recovery", "route-inventory.json"), "utf8"),
);
const reconstructedFiles = await walk(reconstructionRoot);
const reconstructedSet = new Set(reconstructedFiles);

let clientManifest = null;
const clientManifestPath = path.join(
  root,
  "recovery",
  "live-compiled-modules",
  "manifest.json",
);
if (await exists(clientManifestPath)) {
  clientManifest = JSON.parse(await readFile(clientManifestPath, "utf8"));
}
const compiledClientPaths = new Set(
  (clientManifest?.clientMappings ?? [])
    .filter((entry) => entry.captureStatus === "found")
    .map((entry) => entry.projectRelativePath),
);

const files = inventoryRows.map((entry) => {
  const deployedPath = deployedEquivalent(entry.indexedPath);
  const reconstructed =
    reconstructedSet.has(entry.indexedPath) ||
    reconstructedSet.has(deployedPath);
  const moduleMapping = moduleCandidates.mappings[entry.indexedPath];
  const exactServerEntry =
    moduleMapping?.method === "exact-resolvedPagePath";
  const exactClientModule =
    compiledClientPaths.has(entry.indexedPath) ||
    compiledClientPaths.has(deployedPath);

  let status = "indexed-evidence-only";
  if (reconstructed) {
    status = "reconstructed-source";
  } else if (exactServerEntry || exactClientModule) {
    status = "exact-compiled-module-evidence";
  } else if (moduleMapping?.confidence === "high") {
    status = "high-confidence-module-candidate";
  }

  return {
    ...entry,
    deployedEquivalent: deployedPath,
    status,
    reconstructed,
    exactServerEntry,
    exactClientModule,
    rankedServerModuleConfidence: moduleMapping?.confidence ?? null,
  };
});

const indexedDeployedPaths = new Set(
  inventoryRows.map((entry) => deployedEquivalent(entry.indexedPath)),
);
const deployedOnlyApiRoutes = routeInventory.apiSourceFiles.filter(
  (entry) => !indexedDeployedPaths.has(entry),
);
const countsByStatus = Object.fromEntries(
  [
    "reconstructed-source",
    "exact-compiled-module-evidence",
    "high-confidence-module-candidate",
    "indexed-evidence-only",
  ].map((status) => [
    status,
    files.filter((entry) => entry.status === status).length,
  ]),
);

const report = {
  generatedAt: new Date().toISOString(),
  localHead: "0eed85e378fd65c75eaf90b9588a85d11de9f523",
  counts: {
    indexedFiles: files.length,
    reconstructedFilesTotal: reconstructedFiles.length,
    indexedPathsWithReconstructedSource: files.filter(
      (entry) => entry.reconstructed,
    ).length,
    deployedOnlyApiRoutes: deployedOnlyApiRoutes.length,
    byStatus: countsByStatus,
  },
  deployedOnlyApiRoutes,
  reconstructedFiles,
  files,
  interpretation: [
    "Reconstructed source is editable code recreated from surviving evidence; it is not byte-identical original source.",
    "Exact compiled module evidence preserves executable implementation but still requires decompilation and import/name restoration.",
    "High-confidence candidates are ranked reverse-engineering leads and are not proof.",
  ],
};

await mkdir(reportRoot, { recursive: true });
await writeFile(
  path.join(reportRoot, "coverage.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      output: "recovery/source-reconstruction/coverage.json",
      counts: report.counts,
      deployedOnlyApiRoutes,
    },
    null,
    2,
  ),
);
