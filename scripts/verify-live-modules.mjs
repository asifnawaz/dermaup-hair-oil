import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const evidenceRoot = path.join(root, "recovery", "live-compiled-modules");
const checksumPath = path.join(evidenceRoot, "SHA256SUMS.tsv");

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const rows = (await readFile(checksumPath, "utf8"))
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((row) => {
    const [expectedSha256, expectedBytes, relativePath] = row.split("\t");
    if (
      !/^[a-f0-9]{64}$/.test(expectedSha256) ||
      !/^\d+$/.test(expectedBytes) ||
      !relativePath
    ) {
      throw new Error(`Malformed checksum row: ${row}`);
    }
    if (
      path.isAbsolute(relativePath) ||
      relativePath.split("/").includes("..")
    ) {
      throw new Error(`Unsafe checksum path: ${relativePath}`);
    }
    return {
      expectedSha256,
      expectedBytes: Number(expectedBytes),
      relativePath,
    };
  });

const results = [];
for (const row of rows) {
  const bytes = await readFile(path.join(evidenceRoot, row.relativePath));
  results.push({
    path: row.relativePath,
    bytes: bytes.length,
    expectedBytes: row.expectedBytes,
    sha256: sha256(bytes),
    expectedSha256: row.expectedSha256,
    passed:
      bytes.length === row.expectedBytes &&
      sha256(bytes) === row.expectedSha256,
  });
}

const failed = results.filter((result) => !result.passed);
const manifest = JSON.parse(
  await readFile(path.join(evidenceRoot, "manifest.json"), "utf8"),
);
const checks = {
  checksumRows: rows.length,
  allChecksumsPass: failed.length === 0,
  moduleFactoriesExecuted: manifest.counts?.moduleFactoriesExecuted === 0,
  allClientMappingsFound:
    manifest.counts?.clientProjectMappingsMissing === 0,
  allServerEntriesFound:
    manifest.counts?.serverCompiledEntriesMissing === 0,
  validClientFactorySyntax:
    manifest.counts?.clientProjectFactoriesWithInvalidSyntax === 0,
  validServerFactorySyntax:
    manifest.counts?.serverFactoriesWithInvalidSyntax === 0,
};

console.log(
  JSON.stringify(
    {
      checks,
      counts: manifest.counts,
      failed,
    },
    null,
    2,
  ),
);

if (Object.values(checks).some((value) => value === false)) {
  process.exitCode = 1;
}
