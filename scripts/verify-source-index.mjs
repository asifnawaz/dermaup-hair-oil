import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const indexRoot = path.join(root, "recovery", "original-codebase-index");
const evidenceRoot = path.join(indexRoot, "evidence");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function load(relativePath, base = indexRoot) {
  return readFile(path.join(base, relativePath));
}

function parseChecksums(value) {
  const [, ...rows] = value.toString("utf8").trim().split(/\r?\n/);
  return new Map(
    rows.map((row) => {
      const [hash, bytes, ...fileParts] = row.split("\t");
      return [fileParts.join("\t"), { hash, bytes: Number(bytes) }];
    }),
  );
}

async function verifyChecksumSet(base, checksumFile) {
  const declared = parseChecksums(await load(checksumFile, base));
  const results = [];

  for (const [file, expected] of declared) {
    const content = await load(file, base);
    results.push({
      file,
      bytes: content.byteLength,
      expectedBytes: expected.bytes,
      sha256: sha256(content),
      expectedSha256: expected.hash,
      passed:
        content.byteLength === expected.bytes &&
        sha256(content) === expected.hash,
    });
  }

  return results;
}

function parseJsonLines(value) {
  return value
    .toString("utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const [
  payloadChecksums,
  evidenceChecksums,
  projectBuffer,
  recoveryManifestBuffer,
  inventoryBuffer,
  symbolMapBuffer,
  nodesBuffer,
  edgesBuffer,
  routesBuffer,
  evidenceManifestBuffer,
  evidenceBuffer,
] = await Promise.all([
  verifyChecksumSet(indexRoot, "SHA256SUMS.tsv"),
  verifyChecksumSet(evidenceRoot, "SHA256SUMS.tsv"),
  load("PROJECT.json"),
  load("RECOVERY-MANIFEST.json"),
  load("FILE-INVENTORY.tsv"),
  load("FILE-SYMBOL-MAP.json"),
  load("NODES.jsonl"),
  load("EDGES.jsonl"),
  load("ROUTES.json"),
  load("MANIFEST.json", evidenceRoot),
  load("SOURCE-EVIDENCE.jsonl", evidenceRoot),
]);

const project = JSON.parse(projectBuffer);
const recoveryManifest = JSON.parse(recoveryManifestBuffer);
const symbolMap = JSON.parse(symbolMapBuffer);
const nodes = parseJsonLines(nodesBuffer);
const edges = parseJsonLines(edgesBuffer);
const routes = JSON.parse(routesBuffer);
const evidenceManifest = JSON.parse(evidenceManifestBuffer);
const evidence = parseJsonLines(evidenceBuffer);

const [, ...inventoryRows] = inventoryBuffer
  .toString("utf8")
  .trim()
  .split(/\r?\n/);
const inventoryPaths = inventoryRows.map((row) => row.split("\t")[0]);
const uniqueInventoryPaths = new Set(inventoryPaths);
const nodeIds = new Set(nodes.map((node) => node.id));
const edgeIds = new Set(edges.map((edge) => edge.id));
const fileNodes = nodes.filter((node) => node.label === "File");
const unsafePaths = inventoryPaths.filter(
  (entry) =>
    path.posix.isAbsolute(entry) ||
    entry.split("/").includes("..") ||
    entry.includes("\\"),
);
const danglingEdges = edges.filter(
  (edge) => !nodeIds.has(edge.source_id) || !nodeIds.has(edge.target_id),
);

const expectedHead = "0eed85e378fd65c75eaf90b9588a85d11de9f523";
const checks = {
  payloadChecksums: payloadChecksums.every((entry) => entry.passed),
  evidenceChecksums: evidenceChecksums.every((entry) => entry.passed),
  localHead:
    project.branch_evidence?.branch === "main" &&
    project.branch_evidence?.head_sha === expectedHead,
  databaseIntegrity:
    project.database_integrity === "ok" &&
    recoveryManifest.database_integrity === "ok",
  inventoryCount:
    inventoryRows.length === 219 &&
    uniqueInventoryPaths.size === inventoryRows.length,
  symbolMapCount:
    Array.isArray(symbolMap) &&
    symbolMap.length === recoveryManifest.counts.files,
  nodeCount:
    nodes.length === 2024 &&
    nodeIds.size === nodes.length &&
    nodes.length === recoveryManifest.counts.nodes,
  edgeCount:
    edges.length === 5830 &&
    edgeIds.size === edges.length &&
    edges.length === recoveryManifest.counts.edges,
  routeCount:
    routes.length === 28 &&
    routes.length === recoveryManifest.counts.routes,
  fileNodeCount:
    fileNodes.length === inventoryRows.length &&
    new Set(fileNodes.map((node) => node.file_path)).size ===
      inventoryRows.length,
  safePaths: unsafePaths.length === 0,
  graphReferences: danglingEdges.length === 0,
  evidenceCount:
    evidence.length === 2369 &&
    evidence.length === evidenceManifest.records,
  evidenceIsPartial:
    evidence.every((record) => record.complete_source_body === false),
  sourceHashesUnavailable: symbolMap.every((file) => file.sha256 === ""),
};

const result = {
  checks,
  provenance: {
    indexedRoot: project.project.root_path,
    indexedAt: project.project.indexed_at,
    branch: project.branch_evidence.branch,
    localHead: project.branch_evidence.head_sha,
    note: "Local-only Git HEAD; it was never pushed to GitHub.",
  },
  counts: {
    files: inventoryRows.length,
    nodes: nodes.length,
    edges: edges.length,
    routes: routes.length,
    evidenceRecords: evidence.length,
  },
  checksumFiles: {
    sourceIndex: payloadChecksums,
    sourceEvidence: evidenceChecksums,
  },
  limitations: {
    completeSourceBodies: 0,
    sourceFileHashes: 0,
    generatedFilesMustBeLabelledReconstructed: true,
  },
};

console.log(JSON.stringify(result, null, 2));

if (Object.values(checks).some((passed) => !passed)) {
  process.exitCode = 1;
}
