import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workerPath = join(projectRoot, "dist", "worker.js");
const compressedWorkerPath = `${workerPath}.gz`;
const nextRoot = join(projectRoot, "public", "_next");
const chunksRoot = join(nextRoot, "static", "chunks");
const outputRoot = join(
  projectRoot,
  "recovery",
  "live-compiled-modules",
);
const temporaryOutputRoot = `${outputRoot}.tmp-${process.pid}`;
const captureProperty = "__UPDERMA_COMPILED_MODULE_CAPTURE__";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

function posixPath(value) {
  return value.split(sep).join("/");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sorted(values) {
  return [...values].sort(compareText);
}

function sortedUnique(values) {
  return sorted(new Set(values));
}

function cleanError(error) {
  const name = error instanceof Error ? error.name : "Error";
  const message =
    error instanceof Error ? error.message : String(error);
  return `${name}: ${message}`.replaceAll(projectRoot, ".").slice(0, 500);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureWorker() {
  if (await pathExists(workerPath)) {
    return { restored: false, bytes: await readFile(workerPath) };
  }

  const compressed = await readFile(compressedWorkerPath);
  const worker = gunzipSync(compressed);
  await mkdir(dirname(workerPath), { recursive: true });
  await writeFile(workerPath, worker);
  return { restored: true, bytes: worker };
}

async function listFilesRecursively(root, predicate = () => true) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) =>
    compareText(left.name, right.name),
  )) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(path, predicate)));
    } else if (entry.isFile() && predicate(path)) {
      files.push(path);
    }
  }

  return files;
}

function decodeJavaScriptString(raw, start) {
  const quote = raw[start];
  if (quote !== '"' && quote !== "'") {
    throw new Error(`Expected a string at offset ${start}`);
  }

  let value = "";
  let index = start + 1;

  while (index < raw.length) {
    const character = raw[index++];
    if (character === quote) {
      return { value, end: index };
    }
    if (character !== "\\") {
      value += character;
      continue;
    }
    if (index >= raw.length) {
      throw new Error("Unterminated string escape");
    }

    const escaped = raw[index++];
    const simple = {
      "'": "'",
      '"': '"',
      "\\": "\\",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      v: "\v",
      0: "\0",
    };
    if (Object.hasOwn(simple, escaped)) {
      value += simple[escaped];
      continue;
    }
    if (escaped === "\n") {
      continue;
    }
    if (escaped === "\r") {
      if (raw[index] === "\n") {
        index += 1;
      }
      continue;
    }
    if (escaped === "x") {
      const digits = raw.slice(index, index + 2);
      if (!/^[0-9a-fA-F]{2}$/.test(digits)) {
        throw new Error("Invalid hexadecimal string escape");
      }
      value += String.fromCodePoint(Number.parseInt(digits, 16));
      index += 2;
      continue;
    }
    if (escaped === "u") {
      if (raw[index] === "{") {
        const close = raw.indexOf("}", index + 1);
        const digits = close < 0 ? "" : raw.slice(index + 1, close);
        if (!/^[0-9a-fA-F]{1,6}$/.test(digits)) {
          throw new Error("Invalid Unicode code-point escape");
        }
        value += String.fromCodePoint(Number.parseInt(digits, 16));
        index = close + 1;
      } else {
        const digits = raw.slice(index, index + 4);
        if (!/^[0-9a-fA-F]{4}$/.test(digits)) {
          throw new Error("Invalid Unicode string escape");
        }
        value += String.fromCharCode(Number.parseInt(digits, 16));
        index += 4;
      }
      continue;
    }

    // JavaScript treats an otherwise non-special escaped character as itself.
    value += escaped;
  }

  throw new Error(`Unterminated string at offset ${start}`);
}

class DataLiteralParser {
  constructor(source, { bindings = new Map(), start = 0 } = {}) {
    this.source = source;
    this.index = start;
    this.bindings = bindings;
  }

  parse() {
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.index !== this.source.length) {
      throw new Error(
        `Unexpected manifest data at offset ${this.index}`,
      );
    }
    return value;
  }

  parsePartial() {
    const value = this.parseValue();
    this.skipWhitespace();
    return { value, end: this.index };
  }

  skipWhitespace() {
    while (/\s/.test(this.source[this.index] ?? "")) {
      this.index += 1;
    }
  }

  consume(expected) {
    this.skipWhitespace();
    if (this.source[this.index] !== expected) {
      throw new Error(
        `Expected "${expected}" at offset ${this.index}`,
      );
    }
    this.index += 1;
  }

  parseValue() {
    this.skipWhitespace();
    const character = this.source[this.index];

    if (character === "{") {
      return this.parseObject();
    }
    if (character === "[") {
      return this.parseArray();
    }
    if (character === '"' || character === "'") {
      const parsed = decodeJavaScriptString(
        this.source,
        this.index,
      );
      this.index = parsed.end;
      return parsed.value;
    }
    if (character === "-" || /\d/.test(character ?? "")) {
      return this.parseNumber();
    }

    const identifier = this.parseIdentifier();
    if (identifier === "true") {
      return true;
    }
    if (identifier === "false") {
      return false;
    }
    if (identifier === "null") {
      return null;
    }
    if (this.bindings.has(identifier)) {
      return this.bindings.get(identifier);
    }
    throw new Error(
      `Unsupported manifest value "${identifier}" at offset ${this.index}`,
    );
  }

  parseObject() {
    const value = Object.create(null);
    this.consume("{");
    this.skipWhitespace();

    while (this.source[this.index] !== "}") {
      let key;
      const character = this.source[this.index];
      if (character === '"' || character === "'") {
        const parsed = decodeJavaScriptString(
          this.source,
          this.index,
        );
        key = parsed.value;
        this.index = parsed.end;
      } else {
        key = this.parsePropertyKey();
      }

      this.consume(":");
      value[key] = this.parseValue();
      this.skipWhitespace();
      if (this.source[this.index] !== ",") {
        break;
      }
      this.index += 1;
      this.skipWhitespace();
      if (this.source[this.index] === "}") {
        break;
      }
    }

    this.consume("}");
    return value;
  }

  parseArray() {
    const value = [];
    this.consume("[");
    this.skipWhitespace();

    while (this.source[this.index] !== "]") {
      value.push(this.parseValue());
      this.skipWhitespace();
      if (this.source[this.index] !== ",") {
        break;
      }
      this.index += 1;
      this.skipWhitespace();
      if (this.source[this.index] === "]") {
        break;
      }
    }

    this.consume("]");
    return value;
  }

  parseIdentifier() {
    this.skipWhitespace();
    const match = /^[A-Za-z_$][\w$]*/.exec(
      this.source.slice(this.index),
    );
    if (!match) {
      throw new Error(`Expected identifier at offset ${this.index}`);
    }
    this.index += match[0].length;
    return match[0];
  }

  parsePropertyKey() {
    this.skipWhitespace();
    const match = /^(?:[A-Za-z_$][\w$]*|\d+)/.exec(
      this.source.slice(this.index),
    );
    if (!match) {
      throw new Error(`Expected property key at offset ${this.index}`);
    }
    this.index += match[0].length;
    return match[0];
  }

  parseNumber() {
    this.skipWhitespace();
    const match =
      /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(
        this.source.slice(this.index),
      );
    if (!match) {
      throw new Error(`Invalid number at offset ${this.index}`);
    }
    this.index += match[0].length;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) {
      throw new Error(`Non-finite number at offset ${this.index}`);
    }
    return value;
  }
}

function findMatchingBrace(source, openOffset) {
  if (source[openOffset] !== "{") {
    throw new Error(`Expected opening brace at offset ${openOffset}`);
  }

  let depth = 1;
  let index = openOffset + 1;
  const modes = [
    { type: "code", templateBoundaryDepth: null, canStartRegex: true },
  ];
  const regexKeywords = new Set([
    "await",
    "case",
    "delete",
    "do",
    "else",
    "in",
    "instanceof",
    "new",
    "of",
    "return",
    "throw",
    "typeof",
    "void",
    "yield",
  ]);

  while (index < source.length) {
    const mode = modes.at(-1);
    const character = source[index];
    const next = source[index + 1];

    if (mode.type === "template") {
      if (character === "\\") {
        index += 2;
      } else if (character === "`") {
        modes.pop();
        const parent = modes.at(-1);
        if (parent?.type === "code") {
          parent.canStartRegex = false;
        }
        index += 1;
      } else if (character === "$" && next === "{") {
        const boundary = depth;
        depth += 1;
        modes.push({
          type: "code",
          templateBoundaryDepth: boundary,
          canStartRegex: true,
        });
        index += 2;
      } else {
        index += 1;
      }
      continue;
    }

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }
    if (character === "/" && next === "/") {
      const newline = source.indexOf("\n", index + 2);
      index = newline < 0 ? source.length : newline + 1;
      continue;
    }
    if (character === "/" && next === "*") {
      const close = source.indexOf("*/", index + 2);
      if (close < 0) {
        throw new Error("Unterminated block comment");
      }
      index = close + 2;
      continue;
    }
    if (character === '"' || character === "'") {
      const parsed = decodeJavaScriptString(source, index);
      index = parsed.end;
      mode.canStartRegex = false;
      continue;
    }
    if (character === "`") {
      modes.push({ type: "template" });
      index += 1;
      continue;
    }
    if (character === "/" && mode.canStartRegex) {
      index += 1;
      let inCharacterClass = false;
      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
        } else if (source[index] === "[") {
          inCharacterClass = true;
          index += 1;
        } else if (source[index] === "]" && inCharacterClass) {
          inCharacterClass = false;
          index += 1;
        } else if (source[index] === "/" && !inCharacterClass) {
          index += 1;
          while (/[A-Za-z]/.test(source[index] ?? "")) {
            index += 1;
          }
          break;
        } else if (source[index] === "\n") {
          throw new Error("Unterminated regular-expression literal");
        } else {
          index += 1;
        }
      }
      mode.canStartRegex = false;
      continue;
    }
    if (character === "{") {
      depth += 1;
      mode.canStartRegex = true;
      index += 1;
      continue;
    }
    if (character === "}") {
      depth -= 1;
      index += 1;
      if (
        mode.templateBoundaryDepth !== null &&
        depth === mode.templateBoundaryDepth
      ) {
        modes.pop();
        continue;
      }
      if (depth === 0) {
        return index - 1;
      }
      mode.canStartRegex = false;
      continue;
    }
    if ("([,:;?=!".includes(character)) {
      mode.canStartRegex = true;
      index += 1;
      continue;
    }
    if (")]".includes(character)) {
      mode.canStartRegex = false;
      index += 1;
      continue;
    }
    if (/[A-Za-z_$]/.test(character)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(source.slice(index));
      const identifier = match[0];
      index += identifier.length;
      mode.canStartRegex = regexKeywords.has(identifier);
      continue;
    }
    if (/\d/.test(character)) {
      const match =
        /^(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/.exec(
          source.slice(index),
        );
      index += match?.[0].length ?? 1;
      mode.canStartRegex = false;
      continue;
    }

    if (character === "+" || character === "-") {
      if (next === character && !mode.canStartRegex) {
        index += 2;
        mode.canStartRegex = false;
      } else {
        index += next === "=" || next === ">" ? 2 : 1;
        mode.canStartRegex = true;
      }
      continue;
    }
    if ("*&|^~<>%".includes(character)) {
      index +=
        next === character || next === "=" || next === ">" ? 2 : 1;
      mode.canStartRegex = true;
      continue;
    }

    // Operators, including division, permit an expression to follow.
    mode.canStartRegex = character === "/" ? true : mode.canStartRegex;
    index += 1;
  }

  throw new Error(`No matching brace for offset ${openOffset}`);
}

function extractManifestDataBindings(workerSource) {
  const bindings = new Map();
  const declaration = /\bvar\s+(v[0-9a-f]{3,8})\s*=/g;
  let match;

  while ((match = declaration.exec(workerSource)) !== null) {
    let name = match[1];
    let valueOffset = declaration.lastIndex;

    while (name) {
      let parsed;
      try {
        parsed = new DataLiteralParser(workerSource, {
          bindings,
          start: valueOffset,
        }).parsePartial();
      } catch {
        break;
      }
      bindings.set(name, parsed.value);

      const continuation = /^\s*,\s*(v[0-9a-f]{3,8})\s*=/.exec(
        workerSource.slice(parsed.end),
      );
      if (!continuation) {
        break;
      }
      name = continuation[1];
      valueOffset = parsed.end + continuation[0].length;
    }
  }

  return bindings;
}

function extractRscManifests(workerSource) {
  const prefix = "globalThis.__RSC_MANIFEST[";
  const bindings = extractManifestDataBindings(workerSource);
  const manifests = [];
  let cursor = 0;

  while (cursor < workerSource.length) {
    const assignmentOffset = workerSource.indexOf(prefix, cursor);
    if (assignmentOffset < 0) {
      break;
    }

    let index = assignmentOffset + prefix.length;
    while (/\s/.test(workerSource[index] ?? "")) {
      index += 1;
    }
    const routeString = decodeJavaScriptString(workerSource, index);
    index = routeString.end;
    while (/\s/.test(workerSource[index] ?? "")) {
      index += 1;
    }
    if (workerSource[index] !== "]") {
      throw new Error(
        `Invalid RSC manifest route at offset ${assignmentOffset}`,
      );
    }
    index += 1;
    while (/\s/.test(workerSource[index] ?? "")) {
      index += 1;
    }
    if (workerSource[index] !== "=") {
      // The Worker also reads an already-populated manifest with the same
      // bracket syntax. Only an equals sign identifies a literal assignment.
      cursor = index;
      continue;
    }
    index += 1;
    while (/\s/.test(workerSource[index] ?? "")) {
      index += 1;
    }
    if (workerSource[index] !== "{") {
      throw new Error(
        `Invalid RSC manifest object at offset ${assignmentOffset}`,
      );
    }

    const objectEnd = findMatchingBrace(workerSource, index);
    const objectSource = workerSource.slice(index, objectEnd + 1);
    const manifest = new DataLiteralParser(objectSource, {
      bindings,
    }).parse();
    manifests.push({
      route: routeString.value,
      assignmentOffset,
      manifest,
    });
    cursor = objectEnd + 1;
  }

  if (manifests.length === 0) {
    throw new Error("No deployed RSC manifests were found in dist/worker.js");
  }

  return { manifests, bindingCount: bindings.size };
}

function normalizeDeclaredChunks(chunks) {
  if (!Array.isArray(chunks)) {
    return [];
  }
  return sortedUnique(
    chunks
      .filter(
        (entry) =>
          typeof entry === "string" &&
          entry.includes("/") &&
          entry.endsWith(".js"),
      )
      .map((entry) => entry.replace(/^\/?_next\//, "")),
  );
}

function aggregateClientMappings(manifests) {
  const mappings = new Map();

  for (const { route, manifest } of manifests) {
    const clientModules = manifest.clientModules;
    if (
      clientModules === null ||
      typeof clientModules !== "object" ||
      Array.isArray(clientModules)
    ) {
      continue;
    }

    for (const [sourcePath, reference] of Object.entries(
      clientModules,
    )) {
      if (
        reference === null ||
        typeof reference !== "object" ||
        !Object.hasOwn(reference, "id")
      ) {
        continue;
      }
      const moduleId = String(reference.id);
      const key = `${sourcePath}\0${moduleId}`;
      let mapping = mappings.get(key);
      if (!mapping) {
        mapping = {
          sourcePath,
          moduleId,
          routes: new Set(),
          declaredChunks: new Set(),
          exportNames: new Set(),
          asyncValues: new Set(),
        };
        mappings.set(key, mapping);
      }
      mapping.routes.add(route);
      for (const chunk of normalizeDeclaredChunks(reference.chunks)) {
        mapping.declaredChunks.add(chunk);
      }
      if (typeof reference.name === "string") {
        mapping.exportNames.add(reference.name);
      }
      if (typeof reference.async === "boolean") {
        mapping.asyncValues.add(reference.async);
      }
    }
  }

  return [...mappings.values()].sort(
    (left, right) =>
      compareText(left.sourcePath, right.sourcePath) ||
      compareText(left.moduleId, right.moduleId),
  );
}

function validateFactorySyntax(factorySource, label) {
  try {
    new vm.Script(`(${factorySource}\n)`, {
      filename: label,
    });
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: cleanError(error) };
  }
}

function captureWebpackChunk(source, chunkPath) {
  if (
    !source.includes("webpackChunk_N_E") ||
    !/\.push\(\s*\[\s*\[/.test(source)
  ) {
    return {
      status: "not-a-webpack-module-payload",
      error: null,
      payloadCount: 0,
      moduleFactories: [],
    };
  }

  const sandbox = Object.create(null);
  const context = vm.createContext(sandbox, {
    name: `upderma-recovery:${chunkPath}`,
    codeGeneration: { strings: false, wasm: false },
    microtaskMode: "afterEvaluate",
  });
  const setup = new vm.Script(
    `(() => {
      const captures = [];
      const carrier = [];
      carrier.push = function capture(payload) {
        captures[captures.length] = payload;
        return captures.length;
      };
      globalThis.self = globalThis;
      globalThis.webpackChunk_N_E = carrier;
      Object.defineProperty(globalThis, ${JSON.stringify(
        captureProperty,
      )}, {
        value: captures,
        configurable: false,
        enumerable: false,
        writable: false
      });
    })();`,
    { filename: "capture-bootstrap.js" },
  );
  setup.runInContext(context, { timeout: 100 });

  try {
    new vm.Script(source, { filename: chunkPath }).runInContext(
      context,
      {
        timeout: 2_000,
        breakOnSigint: true,
      },
    );
  } catch (error) {
    return {
      status: "capture-error",
      error: cleanError(error),
      payloadCount: 0,
      moduleFactories: [],
    };
  }

  const captures = context[captureProperty];
  const moduleFactories = [];
  for (const payload of captures) {
    if (!Array.isArray(payload) || payload.length < 2) {
      continue;
    }
    const chunkIds = Array.isArray(payload[0])
      ? payload[0].map(String).sort(compareText)
      : [];
    const moduleMap = payload[1];
    if (
      moduleMap === null ||
      (typeof moduleMap !== "object" &&
        typeof moduleMap !== "function")
    ) {
      continue;
    }

    for (const moduleId of Reflect.ownKeys(moduleMap)
      .filter((key) => typeof key === "string")
      .sort(compareText)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        moduleMap,
        moduleId,
      );
      const factory = descriptor?.value;
      if (typeof factory !== "function") {
        continue;
      }

      // Function#toString exposes the compiled factory text; it does not
      // invoke the factory. No Webpack runtime or require function is supplied.
      const factorySource = Function.prototype.toString.call(factory);
      moduleFactories.push({
        moduleId,
        chunkIds,
        factorySource,
        factorySha256: sha256(factorySource),
        syntax: validateFactorySyntax(
          factorySource,
          `${chunkPath}#${moduleId}`,
        ),
      });
    }
  }

  return {
    status: "captured",
    error: null,
    payloadCount: captures.length,
    moduleFactories,
  };
}

async function capturePublicModules() {
  const paths = await listFilesRecursively(
    chunksRoot,
    (path) => path.endsWith(".js"),
  );
  const inputs = [];
  const factoryIndex = new Map();

  for (const path of paths) {
    const bytes = await readFile(path);
    const source = bytes.toString("utf8");
    const chunkPath = posixPath(relative(nextRoot, path));
    const capture = captureWebpackChunk(source, chunkPath);
    inputs.push({
      path: chunkPath,
      bytes: bytes.length,
      sha256: sha256(bytes),
      captureStatus: capture.status,
      captureError: capture.error,
      payloadCount: capture.payloadCount,
      moduleFactoryCount: capture.moduleFactories.length,
    });

    for (const factory of capture.moduleFactories) {
      const occurrence = {
        ...factory,
        chunkPath,
      };
      const occurrences = factoryIndex.get(factory.moduleId) ?? [];
      occurrences.push(occurrence);
      factoryIndex.set(factory.moduleId, occurrences);
    }
  }

  for (const occurrences of factoryIndex.values()) {
    occurrences.sort(
      (left, right) =>
        compareText(left.chunkPath, right.chunkPath) ||
        compareText(left.factorySha256, right.factorySha256),
    );
  }

  return { inputs, factoryIndex };
}

function commonAbsoluteDirectory(paths) {
  const absolute = paths
    .filter((path) => path.startsWith("/"))
    .map((path) => path.split("/").slice(0, -1));
  if (absolute.length === 0) {
    return null;
  }

  const common = [...absolute[0]];
  for (const parts of absolute.slice(1)) {
    let index = 0;
    while (
      index < common.length &&
      index < parts.length &&
      common[index] === parts[index]
    ) {
      index += 1;
    }
    common.length = index;
  }
  return common.join("/") || "/";
}

function sourceOwnership(sourcePath, deployedProjectRoot) {
  if (
    deployedProjectRoot &&
    (sourcePath === deployedProjectRoot ||
      sourcePath.startsWith(`${deployedProjectRoot}/`))
  ) {
    const projectRelativePath = sourcePath
      .slice(deployedProjectRoot.length)
      .replace(/^\//, "");
    return {
      ownership: projectRelativePath.startsWith("node_modules/")
        ? "third-party"
        : "project",
      projectRelativePath,
    };
  }
  return { ownership: "external", projectRelativePath: null };
}

function findModuleHeaders(workerSource) {
  const pattern =
    /(?:^|[,{])\s*(\d+)\s*:\s*(\([^()\n]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/gm;
  const headers = [];
  let match;

  while ((match = pattern.exec(workerSource)) !== null) {
    const paramsOffset = match[0].lastIndexOf(match[2]);
    headers.push({
      moduleId: match[1],
      start: match.index + paramsOffset,
      openBrace: match.index + match[0].length - 1,
      end: null,
    });
  }
  return headers;
}

function lastHeaderBefore(headers, offset) {
  let low = 0;
  let high = headers.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (headers[middle].start < offset) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low - 1;
}

function lastStringPropertyBefore(source, property, beforeOffset) {
  const pattern = new RegExp(
    `\\b${property}:\\s*("(?:\\\\.|[^"\\\\])*")`,
    "g",
  );
  let result = null;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    if (match.index >= beforeOffset) {
      break;
    }
    result = decodeJavaScriptString(match[1], 0).value;
  }
  return result;
}

function extractServerEntries(workerSource) {
  const headers = findModuleHeaders(workerSource);
  const resolvedPattern =
    /resolvedPagePath:\s*("(?:\\.|[^"\\])*")/g;
  const entries = [];
  const missing = [];
  let resolvedMatch;

  while ((resolvedMatch = resolvedPattern.exec(workerSource)) !== null) {
    const resolvedPagePath = decodeJavaScriptString(
      resolvedMatch[1],
      0,
    ).value;
    let headerIndex = lastHeaderBefore(headers, resolvedMatch.index);
    let enclosing = null;

    while (headerIndex >= 0) {
      const candidate = headers[headerIndex];
      try {
        candidate.end ??= findMatchingBrace(
          workerSource,
          candidate.openBrace,
        );
      } catch {
        candidate.end = -1;
      }
      if (candidate.end >= resolvedMatch.index) {
        enclosing = candidate;
        break;
      }
      headerIndex -= 1;
    }

    if (!enclosing) {
      missing.push({
        resolvedPagePath,
        reason: "No enclosing Worker module factory was found",
      });
      continue;
    }

    const factorySource = workerSource.slice(
      enclosing.start,
      enclosing.end + 1,
    );
    const localResolvedOffset =
      resolvedMatch.index - enclosing.start;
    entries.push({
      resolvedPagePath,
      moduleId: enclosing.moduleId,
      routePage: lastStringPropertyBefore(
        factorySource,
        "page",
        localResolvedOffset,
      ),
      routePathname: lastStringPropertyBefore(
        factorySource,
        "pathname",
        localResolvedOffset,
      ),
      bundlePath: lastStringPropertyBefore(
        factorySource,
        "bundlePath",
        localResolvedOffset,
      ),
      workerOffsets: {
        start: enclosing.start,
        endExclusive: enclosing.end + 1,
      },
      factorySource,
      factorySha256: sha256(factorySource),
      syntax: validateFactorySyntax(
        factorySource,
        `worker.js#${enclosing.moduleId}`,
      ),
    });
  }

  entries.sort(
    (left, right) =>
      compareText(left.resolvedPagePath, right.resolvedPagePath) ||
      compareText(left.moduleId, right.moduleId),
  );
  missing.sort((left, right) =>
    compareText(left.resolvedPagePath, right.resolvedPagePath),
  );
  return { entries, missing, discovered: entries.length + missing.length };
}

function chooseFactoryCandidates(mapping, occurrences) {
  const declaredChunks = new Set(mapping.declaredChunks);
  const declaredMatches = occurrences.filter((occurrence) =>
    declaredChunks.has(occurrence.chunkPath),
  );
  const candidates =
    declaredMatches.length > 0 ? declaredMatches : occurrences;
  const uniqueByFactory = new Map();

  for (const candidate of candidates) {
    let grouped = uniqueByFactory.get(candidate.factorySha256);
    if (!grouped) {
      grouped = {
        factorySource: candidate.factorySource,
        factorySha256: candidate.factorySha256,
        syntax: candidate.syntax,
        chunks: new Set(),
        chunkIds: new Set(),
      };
      uniqueByFactory.set(candidate.factorySha256, grouped);
    }
    grouped.chunks.add(candidate.chunkPath);
    for (const chunkId of candidate.chunkIds) {
      grouped.chunkIds.add(chunkId);
    }
  }

  return [...uniqueByFactory.values()]
    .map((candidate) => ({
      ...candidate,
      chunks: sorted(candidate.chunks),
      chunkIds: sorted(candidate.chunkIds),
    }))
    .sort((left, right) =>
      compareText(left.factorySha256, right.factorySha256),
    );
}

function evidenceHeader({
  kind,
  sourcePath,
  projectRelativePath,
  moduleId,
  deploymentLocations,
  factorySha256,
}) {
  const lines = [
    "COMPILED DEPLOYMENT EVIDENCE",
    "This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.",
    "Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.",
    `Evidence kind: ${kind}`,
    `Deployed source path: ${sourcePath}`,
    `Project-relative source path: ${projectRelativePath ?? "unknown"}`,
    `Module ID: ${moduleId}`,
    `Deployment location(s): ${deploymentLocations.join(", ")}`,
    `Captured factory SHA-256: ${factorySha256}`,
    "The factory below is preserved as data and is not executed by the extractor.",
  ];
  return `${lines.map((line) => `// ${line}`).join("\n")}\n\n`;
}

async function writeEvidenceFile(
  relativePath,
  factorySource,
  metadata,
) {
  const content = `${evidenceHeader(metadata)}(${factorySource});\n`;
  const path = join(temporaryOutputRoot, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
  return {
    path: posixPath(relativePath),
    bytes: byteLength(content),
    sha256: sha256(content),
    factoryBytes: byteLength(factorySource),
    factorySha256: metadata.factorySha256,
  };
}

function pathFingerprint(sourcePath) {
  return sha256(sourcePath).slice(0, 12);
}

async function main() {
  const worker = await ensureWorker();
  const workerSource = worker.bytes.toString("utf8");
  const activeToken = /\bcfut_[A-Za-z0-9_-]{20,}\b/.exec(workerSource);
  if (activeToken) {
    throw new Error(
      "dist/worker.js appears to contain an active Cloudflare API token; sanitize it before extraction",
    );
  }

  const rscExtraction = extractRscManifests(workerSource);
  const manifests = rscExtraction.manifests;
  const clientMappings = aggregateClientMappings(manifests);
  const server = extractServerEntries(workerSource);
  const captured = await capturePublicModules();
  const deployedProjectRoot = commonAbsoluteDirectory([
    ...clientMappings.map((mapping) => mapping.sourcePath),
    ...server.entries.map((entry) => entry.resolvedPagePath),
  ]);

  await rm(temporaryOutputRoot, { recursive: true, force: true });
  await mkdir(temporaryOutputRoot, { recursive: true });

  const clientManifest = [];
  let projectClientFound = 0;
  let projectClientMissing = 0;
  let projectClientAmbiguous = 0;
  let projectClientSyntaxInvalid = 0;

  for (const mapping of clientMappings) {
    const ownership = sourceOwnership(
      mapping.sourcePath,
      deployedProjectRoot,
    );
    const occurrences =
      captured.factoryIndex.get(mapping.moduleId) ?? [];
    const candidates = chooseFactoryCandidates(mapping, occurrences);
    const evidence = [];

    if (ownership.ownership === "project") {
      if (candidates.length === 0) {
        projectClientMissing += 1;
      } else {
        projectClientFound += 1;
        if (candidates.length > 1) {
          projectClientAmbiguous += 1;
        }
      }

      for (const candidate of candidates) {
        if (!candidate.syntax.valid) {
          projectClientSyntaxInvalid += 1;
        }
        const relativeEvidencePath = join(
          "client",
          `${mapping.moduleId}-${pathFingerprint(
            mapping.sourcePath,
          )}-${candidate.factorySha256.slice(0, 12)}.compiled.js`,
        );
        evidence.push({
          ...(await writeEvidenceFile(
            relativeEvidencePath,
            candidate.factorySource,
            {
              kind: "client Webpack module",
              sourcePath: mapping.sourcePath,
              projectRelativePath: ownership.projectRelativePath,
              moduleId: mapping.moduleId,
              deploymentLocations: candidate.chunks,
              factorySha256: candidate.factorySha256,
            },
          )),
          chunks: candidate.chunks,
          chunkIds: candidate.chunkIds,
          syntaxValid: candidate.syntax.valid,
          syntaxError: candidate.syntax.error,
        });
      }
    }

    clientManifest.push({
      sourcePath: mapping.sourcePath,
      projectRelativePath: ownership.projectRelativePath,
      ownership: ownership.ownership,
      moduleId: mapping.moduleId,
      exportNames: sorted(mapping.exportNames),
      asyncValues: [...mapping.asyncValues].sort(),
      manifestRoutes: sorted(mapping.routes),
      declaredChunks: sorted(mapping.declaredChunks),
      capturedFactoryVariants: candidates.length,
      captureStatus:
        candidates.length === 0
          ? "missing"
          : candidates.length === 1
            ? "found"
            : "found-multiple-variants",
      evidence,
    });
  }

  const serverManifest = [];
  let serverSyntaxInvalid = 0;
  for (const entry of server.entries) {
    const ownership = sourceOwnership(
      entry.resolvedPagePath,
      deployedProjectRoot,
    );
    if (!entry.syntax.valid) {
      serverSyntaxInvalid += 1;
    }
    const relativeEvidencePath = join(
      "server",
      `${entry.moduleId}-${pathFingerprint(
        entry.resolvedPagePath,
      )}-${entry.factorySha256.slice(0, 12)}.compiled.js`,
    );
    const evidence = await writeEvidenceFile(
      relativeEvidencePath,
      entry.factorySource,
      {
        kind: "server Worker route-entry module",
        sourcePath: entry.resolvedPagePath,
        projectRelativePath: ownership.projectRelativePath,
        moduleId: entry.moduleId,
        deploymentLocations: ["dist/worker.js"],
        factorySha256: entry.factorySha256,
      },
    );
    serverManifest.push({
      resolvedPagePath: entry.resolvedPagePath,
      projectRelativePath: ownership.projectRelativePath,
      ownership: ownership.ownership,
      moduleId: entry.moduleId,
      routePage: entry.routePage,
      routePathname: entry.routePathname,
      bundlePath: entry.bundlePath,
      workerOffsets: entry.workerOffsets,
      syntaxValid: entry.syntax.valid,
      syntaxError: entry.syntax.error,
      evidence,
    });
  }

  const allClientSourcePaths = new Set(
    clientMappings.map((mapping) => mapping.sourcePath),
  );
  const projectClientMappings = clientManifest.filter(
    (mapping) => mapping.ownership === "project",
  );
  const thirdPartyClientMappings = clientManifest.filter(
    (mapping) => mapping.ownership === "third-party",
  );
  const projectServerEntries = serverManifest.filter(
    (entry) => entry.ownership === "project",
  );
  const capturedFactoryOccurrences = [...captured.factoryIndex.values()]
    .map((occurrences) => occurrences.length)
    .reduce((total, count) => total + count, 0);
  const capturedChunkFiles = captured.inputs.filter(
    (input) => input.captureStatus === "captured",
  ).length;
  const chunkCaptureErrors = captured.inputs.filter(
    (input) => input.captureStatus === "capture-error",
  ).length;

  const counts = {
    rscDataBindings: rscExtraction.bindingCount,
    rscManifestAssignments: manifests.length,
    rscManifestRoutes: new Set(
      manifests.map((manifest) => manifest.route),
    ).size,
    clientUniqueSourcePaths: allClientSourcePaths.size,
    clientSourceModuleMappings: clientMappings.length,
    clientProjectMappings: projectClientMappings.length,
    clientProjectMappingsFound: projectClientFound,
    clientProjectMappingsMissing: projectClientMissing,
    clientProjectMappingsWithMultipleVariants:
      projectClientAmbiguous,
    clientProjectFactoriesWithInvalidSyntax:
      projectClientSyntaxInvalid,
    clientThirdPartyMappings: thirdPartyClientMappings.length,
    publicJavaScriptChunks: captured.inputs.length,
    capturedChunkFiles,
    chunkCaptureErrors,
    capturedModuleFactoryOccurrences: capturedFactoryOccurrences,
    capturedUniqueModuleIds: captured.factoryIndex.size,
    serverResolvedPagePathsDiscovered: server.discovered,
    serverCompiledEntriesFound: server.entries.length,
    serverProjectEntriesFound: projectServerEntries.length,
    serverExternalEntriesFound:
      server.entries.length - projectServerEntries.length,
    serverCompiledEntriesMissing: server.missing.length,
    serverFactoriesWithInvalidSyntax: serverSyntaxInvalid,
    moduleFactoriesExecuted: 0,
  };

  const chunkSetDescriptor = captured.inputs
    .map((input) => `${input.path}\0${input.sha256}\n`)
    .join("");
  const manifest = {
    formatVersion: 1,
    evidenceType: "compiled-deployment-evidence",
    notice: [
      "These files are compiled deployment evidence, not the original source tree.",
      "The extractor captures module factory text but never invokes a captured factory.",
      "Do not rename the evidence files to .ts or .tsx or represent them as exact original source.",
    ],
    deployedProjectRoot,
    inputs: {
      worker: {
        path: "dist/worker.js",
        bytes: worker.bytes.length,
        sha256: sha256(worker.bytes),
        sanitizationMarkerPresent: workerSource.includes(
          "__REDACTED_CLOUDFLARE_API_TOKEN__",
        ),
      },
      publicChunks: {
        root: "public/_next/static/chunks",
        fileCount: captured.inputs.length,
        setSha256: sha256(chunkSetDescriptor),
        files: captured.inputs,
      },
    },
    counts,
    missingServerEntries: server.missing,
    clientMappings: clientManifest,
    serverEntries: serverManifest,
  };

  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(
    join(temporaryOutputRoot, "manifest.json"),
    manifestText,
    "utf8",
  );

  const readme = `# Live compiled module evidence

This directory contains **compiled deployment evidence**, not the lost original TypeScript/TSX source.

The extraction used the sanitized \`dist/worker.js\`, the deployed RSC client-reference manifests embedded in that Worker, and the recovered public files under \`public/_next/static/chunks\`.

The public chunks were evaluated only inside an isolated \`node:vm\` context whose \`webpackChunk_N_E.push\` function records payloads. Captured Webpack module factory functions were converted to text but were never called. Server route-entry factories were sliced from the sanitized Worker and syntax-checked without execution.

- RSC manifest assignments: ${counts.rscManifestAssignments}
- Project client mappings found: ${counts.clientProjectMappingsFound}
- Project client mappings missing: ${counts.clientProjectMappingsMissing}
- Compiled server entries found: ${counts.serverCompiledEntriesFound}
- Compiled project server entries found: ${counts.serverProjectEntriesFound}
- Additional metadata-loader server entries found: ${counts.serverExternalEntriesFound}
- Compiled server entries missing: ${counts.serverCompiledEntriesMissing}
- Captured factories executed: ${counts.moduleFactoriesExecuted}

\`manifest.json\` records source-path mappings, module IDs, declared and observed chunks, found/missing counts, syntax results, and SHA-256 checksums. \`SHA256SUMS.tsv\` covers every generated file except itself.
`;
  await writeFile(
    join(temporaryOutputRoot, "README.md"),
    readme,
    "utf8",
  );

  const generatedFiles = await listFilesRecursively(
    temporaryOutputRoot,
    (path) => !path.endsWith("SHA256SUMS.tsv"),
  );
  const checksumRows = [];
  for (const path of generatedFiles) {
    const bytes = await readFile(path);
    checksumRows.push(
      `${sha256(bytes)}\t${bytes.length}\t${posixPath(
        relative(temporaryOutputRoot, path),
      )}`,
    );
  }
  await writeFile(
    join(temporaryOutputRoot, "SHA256SUMS.tsv"),
    `sha256\tbytes\tpath\n${checksumRows.join("\n")}\n`,
    "utf8",
  );

  await rm(outputRoot, { recursive: true, force: true });
  await rename(temporaryOutputRoot, outputRoot);

  console.log(
    JSON.stringify(
      {
        output: posixPath(relative(projectRoot, outputRoot)),
        counts,
      },
      null,
      2,
    ),
  );

  if (
    server.missing.length > 0 ||
    serverSyntaxInvalid > 0 ||
    projectClientSyntaxInvalid > 0
  ) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  await rm(temporaryOutputRoot, { recursive: true, force: true });
  throw error;
}
