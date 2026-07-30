import {
  createCipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/encrypt-d1-backup.mjs INPUT.sql OUTPUT.sql.aes",
  );
}

const magic = Buffer.from("UPDERMA-D1-AES256GCM\0", "utf8");
const key = randomBytes(32);
const iv = randomBytes(12);
const plaintext = await readFile(inputPath);
const cipher = createCipheriv("aes-256-gcm", key, iv);
cipher.setAAD(magic);
const ciphertext = Buffer.concat([
  cipher.update(plaintext),
  cipher.final(),
]);
const authTag = cipher.getAuthTag();
const encrypted = Buffer.concat([magic, iv, authTag, ciphertext]);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, encrypted);

console.log(
  JSON.stringify({
    algorithm: "AES-256-GCM",
    keyHex: key.toString("hex"),
    plaintextBytes: plaintext.length,
    plaintextSha256: createHash("sha256")
      .update(plaintext)
      .digest("hex"),
    encryptedBytes: encrypted.length,
    encryptedSha256: createHash("sha256")
      .update(encrypted)
      .digest("hex"),
  }),
);

