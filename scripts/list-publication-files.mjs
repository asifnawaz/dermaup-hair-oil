import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const excludedDirectories = new Set([
  '.next',
  '.open-next',
  '.wrangler',
  'backups',
  'node_modules',
  'private-backup',
  'raw',
]);

const excludedDirectoryPaths = new Set([
  'public/cdn-cgi',
  'reconstructed-source/public',
]);

const excludedFilePaths = new Set(['dist/worker.js']);

function shouldExcludeFile(relativePath) {
  const basename = path.posix.basename(relativePath);

  if (excludedFilePaths.has(relativePath)) return true;
  if (basename === '.env' || basename === '.dev.vars') return true;
  if (basename.startsWith('.env.') && basename !== '.env.example') return true;
  if (
    basename.startsWith('.dev.vars.') &&
    basename !== '.dev.vars.example'
  ) {
    return true;
  }
  if (basename.endsWith('.tsbuildinfo') || basename.endsWith('.log')) return true;
  if (basename.endsWith('.dump') || basename.endsWith('.sql.gz')) return true;
  if (/\.(?:sqlite|sqlite3|db|db-wal|db-shm)$/i.test(basename)) return true;
  if (/^upderma-db.*\.sql$/i.test(basename)) return true;

  return false;
}

function walk(directory, relativeDirectory = '') {
  const records = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isSymbolicLink()) continue;

    if (entry.isDirectory()) {
      if (
        excludedDirectories.has(entry.name) ||
        excludedDirectoryPaths.has(relativePath)
      ) {
        continue;
      }
      records.push(...walk(absolutePath, relativePath));
      continue;
    }

    if (!entry.isFile() || shouldExcludeFile(relativePath)) continue;

    const contents = fs.readFileSync(absolutePath);
    records.push({
      path: relativePath,
      absolutePath,
      bytes: contents.byteLength,
      gitBlobSha: crypto
        .createHash('sha1')
        .update(`blob ${contents.byteLength}\0`)
        .update(contents)
        .digest('hex'),
      sha256: crypto.createHash('sha256').update(contents).digest('hex'),
    });
  }

  return records;
}

const files = walk(root).sort((left, right) =>
  left.path.localeCompare(right.path),
);

process.stdout.write(
  JSON.stringify(
    {
      root,
      count: files.length,
      bytes: files.reduce((total, file) => total + file.bytes, 0),
      files,
    },
    null,
    2,
  ),
);
