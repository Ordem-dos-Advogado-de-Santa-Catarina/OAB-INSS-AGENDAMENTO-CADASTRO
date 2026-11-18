import crypto from "node:crypto";
import { ENV } from "./env";

const PREFIX = "enc:v1:";

function getKey() {
  return crypto.createHash("sha256").update(ENV.cookieSecret).digest();
}

export function encryptSecret(value: string) {
  if (!value || value.startsWith(PREFIX)) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptSecret(value: string | null | undefined) {
  if (!value || !value.startsWith(PREFIX)) return value ?? null;
  try {
    const [iv, tag, ciphertext] = value.slice(PREFIX.length).split(".");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Não foi possível descriptografar a credencial SMTP");
  }
}
