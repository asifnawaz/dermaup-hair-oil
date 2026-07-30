import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const indexRoot = path.join(root, "recovery", "original-codebase-index");
const outputRoot = path.join(root, "recovery", "source-reconstruction");
const sourceRoot = "/home/asifnawaz/git/dermaup-hair-oil/";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseJsonLines(value) {
  return value
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function tokenSet(value) {
  const ignored = new Set([
    "async",
    "await",
    "body",
    "boolean",
    "catch",
    "children",
    "class",
    "className",
    "const",
    "data",
    "default",
    "Error",
    "export",
    "false",
    "from",
    "function",
    "get",
    "headers",
    "import",
    "item",
    "items",
    "join",
    "length",
    "map",
    "Math",
    "name",
    "new",
    "null",
    "number",
    "Object",
    "parseInt",
    "path",
    "Promise",
    "props",
    "Request",
    "Response",
    "result",
    "return",
    "set",
    "split",
    "status",
    "string",
    "stringify",
    "then",
    "this",
    "true",
    "type",
    "undefined",
    "value",
  ]);
  const result = new Set();

  for (const token of value.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) ?? []) {
    if (
      token.length < 3 ||
      ignored.has(token) ||
      /^[_$]*[a-z]\d*$/.test(token)
    ) {
      continue;
    }
    result.add(token);
  }

  return result;
}

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

const [worker, nodesText, edgesText, symbolMapText] = await Promise.all([
  readFile(path.join(root, "dist", "worker.js"), "utf8"),
  readFile(path.join(indexRoot, "NODES.jsonl"), "utf8"),
  readFile(path.join(indexRoot, "EDGES.jsonl"), "utf8"),
  readFile(path.join(indexRoot, "FILE-SYMBOL-MAP.json"), "utf8"),
]);

const lines = worker.split("\n");
const starts = [];
for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(
    /^\s*},\s*(\d+):\s*\(([^)]*)\)\s*=>\s*\{\s*$/,
  );
  if (match) {
    starts.push({
      line: index,
      moduleId: match[1],
      parameters: match[2],
    });
  }
}

const variantsByModule = new Map();
let invalidFactories = 0;
for (let index = 0; index < starts.length - 1; index += 1) {
  const current = starts[index];
  const next = starts[index + 1];
  const code = `(${current.parameters}) => {\n${lines
    .slice(current.line + 1, next.line)
    .join("\n")}\n}`;

  try {
    Function(`return (${code});`);
  } catch {
    invalidFactories += 1;
    continue;
  }

  const hash = sha256(code);
  if (!variantsByModule.has(current.moduleId)) {
    variantsByModule.set(current.moduleId, new Map());
  }
  const variants = variantsByModule.get(current.moduleId);
  const existing = variants.get(hash);
  variants.set(hash, {
    code,
    hash,
    occurrences: (existing?.occurrences ?? 0) + 1,
  });
}

const modules = new Map();
for (const [moduleId, variants] of variantsByModule) {
  const selected = [...variants.values()].sort(
    (left, right) =>
      right.occurrences - left.occurrences ||
      left.code.length - right.code.length,
  )[0];
  modules.set(moduleId, {
    ...selected,
    moduleId,
    tokens: tokenSet(selected.code),
    variantCount: variants.size,
  });
}

const exactDeployedPaths = new Map();
for (const module of modules.values()) {
  for (const match of module.code.matchAll(
    /resolvedPagePath:\s*["']\/home\/asifnawaz\/git\/dermaup-hair-oil\/([^"']+)["']/g,
  )) {
    exactDeployedPaths.set(match[1], module);
  }
}

const nodes = parseJsonLines(nodesText);
const edges = parseJsonLines(edgesText);
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const sourceFiles = JSON.parse(symbolMapText).map((file) => file.rel_path);
const evidenceByFile = new Map(
  sourceFiles.map((file) => [
    file,
    { allTokens: new Set(), strongTokens: new Set() },
  ]),
);

for (const node of nodes) {
  if (
    !node.file_path ||
    ["File", "Folder", "Module", "Project", "Branch", "Route"].includes(
      node.label,
    )
  ) {
    continue;
  }
  const evidence = evidenceByFile.get(node.file_path);
  if (!evidence) {
    continue;
  }
  if (node.name?.length >= 3) {
    evidence.strongTokens.add(node.name);
    evidence.allTokens.add(node.name);
  }
  for (const token of tokenSet(node.properties?.bt ?? "")) {
    evidence.allTokens.add(token);
  }
}

for (const edge of edges) {
  if (!["CALLS", "HTTP_CALLS", "USAGE"].includes(edge.type)) {
    continue;
  }
  const sourceNode = nodeById.get(edge.source_id);
  const evidence = evidenceByFile.get(sourceNode?.file_path);
  if (!evidence) {
    continue;
  }
  for (const token of tokenSet(edge.properties?.callee ?? "")) {
    evidence.allTokens.add(token);
  }
  for (const argument of edge.properties?.args ?? []) {
    for (const token of tokenSet(argument.e ?? "")) {
      evidence.allTokens.add(token);
    }
  }
}

function rankCandidates(file) {
  const evidence = evidenceByFile.get(file);
  const candidates = [];

  for (const module of modules.values()) {
    let shared = 0;
    let strong = 0;
    const sharedTokens = [];
    for (const token of evidence.allTokens) {
      if (module.tokens.has(token)) {
        shared += 1;
        if (sharedTokens.length < 20) {
          sharedTokens.push(token);
        }
      }
    }
    for (const token of evidence.strongTokens) {
      if (module.tokens.has(token)) {
        strong += 1;
      }
    }
    if (shared === 0 && strong === 0) {
      continue;
    }
    const score =
      (shared + strong * 3) /
      Math.sqrt((evidence.allTokens.size + 1) * (module.tokens.size + 1));
    candidates.push({
      moduleId: module.moduleId,
      score: Number(score.toFixed(6)),
      sharedTokens: shared,
      strongSymbolMatches: strong,
      evidenceTokens: evidence.allTokens.size,
      moduleTokens: module.tokens.size,
      moduleSha256: module.hash,
      moduleOccurrences: module.occurrences,
      moduleVariants: module.variantCount,
      sampleSharedTokens: sharedTokens,
    });
  }

  return candidates
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.strongSymbolMatches - left.strongSymbolMatches ||
        right.sharedTokens - left.sharedTokens,
    )
    .slice(0, 5);
}

const mappings = {};
let exactMatches = 0;
let highConfidenceCandidates = 0;

for (const indexedPath of sourceFiles) {
  const deployedPath = deployedEquivalent(indexedPath);
  const exactModule = exactDeployedPaths.get(deployedPath);
  const candidates = rankCandidates(indexedPath);
  let method = "ranked-token-evidence";
  let confidence = "low";

  if (exactModule) {
    method = "exact-resolvedPagePath";
    confidence = "exact-compiled-entry";
    exactMatches += 1;
  } else if (
    candidates[0]?.score >= 0.28 &&
    candidates[0].sharedTokens >= 3 &&
    candidates[0].score >= (candidates[1]?.score ?? 0) * 1.35
  ) {
    confidence = "high";
    highConfidenceCandidates += 1;
  } else if (
    candidates[0]?.score >= 0.18 &&
    candidates[0].sharedTokens >= 3
  ) {
    confidence = "medium";
  }

  mappings[indexedPath] = {
    deployedEquivalent: deployedPath,
    method,
    confidence,
    exactModule: exactModule
      ? {
          moduleId: exactModule.moduleId,
          moduleSha256: exactModule.hash,
          moduleOccurrences: exactModule.occurrences,
          moduleVariants: exactModule.variantCount,
        }
      : null,
    candidates,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  input: {
    worker: "dist/worker.js",
    workerSha256: sha256(worker),
    localHead: "0eed85e378fd65c75eaf90b9588a85d11de9f523",
    sourceIndex: "recovery/original-codebase-index",
  },
  extraction: {
    detectedFactoryStarts: starts.length,
    invalidFactorySlices: invalidFactories,
    uniqueValidModuleIds: modules.size,
    moduleIdsWithVariants: [...modules.values()].filter(
      (module) => module.variantCount > 1,
    ).length,
    exactResolvedSourcePaths: exactDeployedPaths.size,
  },
  mappingSummary: {
    indexedFiles: sourceFiles.length,
    exactCompiledEntryMatches: exactMatches,
    highConfidenceTokenCandidates: highConfidenceCandidates,
    warning:
      "Ranked candidates are reverse-engineering leads, not proof. Only exact-resolvedPagePath mappings are directly asserted by the deployed bundle.",
  },
  mappings,
};

await mkdir(outputRoot, { recursive: true });
await writeFile(
  path.join(outputRoot, "server-module-candidates.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      output:
        "recovery/source-reconstruction/server-module-candidates.json",
      extraction: report.extraction,
      mappingSummary: report.mappingSummary,
    },
    null,
    2,
  ),
);
