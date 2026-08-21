import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTPayload } from "jose";
import { config } from "../config.js";

const sessionKey = new TextEncoder().encode(config.AUTH_JWT_SECRET);
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, encodedSalt, encodedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !encodedSalt || !encodedHash) return false;

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = await deriveKey(password, Buffer.from(encodedSalt, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSessionToken(authId: string) {
  return new SignJWT({ kind: "washwise-session" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(authId)
    .setIssuer("washwise-api")
    .setAudience("washwise-web")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionKey);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, sessionKey, {
    issuer: "washwise-api",
    audience: "washwise-web"
  });
  if (!payload.sub) throw new Error("Authentication token has no subject");
  return payload;
}

export async function verifyGoogleCredential(credential: string) {
  if (!config.GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured.");
  const { payload } = await jwtVerify(credential, googleJwks, {
    audience: config.GOOGLE_CLIENT_ID,
    issuer: ["https://accounts.google.com", "accounts.google.com"]
  });
  if (!payload.sub || typeof payload.email !== "string" || payload.email_verified !== true) {
    throw new Error("Google could not verify this account.");
  }
  return payload as JWTPayload & { sub: string; email: string };
}
