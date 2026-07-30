import { createDecipheriv } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const [, , encryptedPath, outputPath, suppliedKey] = process.argv;
const keyHex = suppliedKey || process.env.UPDERMA_BACKUP_KEY;
if (!encryptedPath || !outputPath || !keyHex) {
  throw new Error(
    "Usage: node scripts/decrypt-d1-backup.mjs BACKUP.sql.aes OUTPUT.sql KEY_HEX",
  );
}
if (!/^[a-f0-9]{64}$/i.test(keyHex)) {
  throw new Error("The backup key must be exactly 64 hexadecimal characters");
}

const magic = Buffer.from("UPDERMA-D1-AES256GCM\0", "utf8");
const encrypted = await readFile(encryptedPath);
if (!encrypted.subarray(0, magic.length).equals(magic)) {
  throw new Error("This is not an UpDerma AES-256-GCM backup");
}

const ivStart = magic.length;
const tagStart = ivStart + 12;
const dataStart = tagStart + 16;
const iv = encrypted.subarray(ivStart, tagStart);
const authTag = encrypted.subarray(tagStart, dataStart);
const ciphertext = encrypted.subarray(dataStart);
const decipher = createDecipheriv(
  "aes-256-gcm",
  Buffer.from(keyHex, "hex"),
  iv,
);
decipher.setAAD(magic);
decipher.setAuthTag(authTag);
const plaintext = Buffer.concat([
  decipher.update(ciphertext),
  decipher.final(),
]);

await writeFile(outputPath, plaintext);
console.log(`Decrypted ${plaintext.length} bytes to ${outputPath}`);
