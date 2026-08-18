import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { NextFunction, Request, Response } from "express";
import { adminUserIds, config } from "../config.js";
import { User } from "../models/User.js";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getBearerToken(request: Request) {
  const header = request.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : undefined;
}

function stringClaim(payload: JWTPayload, ...keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

async function verifyClerkToken(token: string) {
  if (!config.CLERK_JWKS_URL) {
    throw new Error("CLERK_JWKS_URL is required when demo mode is disabled");
  }
  jwks ??= createRemoteJWKSet(new URL(config.CLERK_JWKS_URL));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.CLERK_ISSUER || undefined
  });
  if (!payload.sub) throw new Error("Authentication token has no subject");
  return payload;
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  try {
    let authId: string;
    let email = "";
    let name = "WashWise Customer";
    let avatarUrl: string | undefined;

    if (config.DEMO_MODE) {
      const demoId = request.header("x-demo-user-id") || "demo-customer";
      authId = demoId === "demo-admin" ? "demo-admin" : "demo-customer";
      email = authId === "demo-admin" ? "admin@washwise.demo" : "customer@washwise.demo";
      name = authId === "demo-admin" ? "Alex Admin" : "Jamie Cruz";
    } else {
      const token = getBearerToken(request);
      if (!token) return response.status(401).json({ error: "Sign in to continue." });
      const payload = await verifyClerkToken(token);
      authId = payload.sub!;
      email = stringClaim(payload, "email", "primary_email_address") || "";
      name = stringClaim(payload, "name", "full_name", "first_name") || name;
      avatarUrl = stringClaim(payload, "image_url", "picture");
    }

    const isAdmin = authId === "demo-admin" || adminUserIds.has(authId);
    const user = await User.findOneAndUpdate(
      { authId },
      {
        $set: { email, name, avatarUrl, role: isAdmin ? "admin" : "customer" },
        $setOnInsert: { isGuest: false }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    request.authId = authId;
    request.authUser = user;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    response.status(401).json({ error: message });
  }
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.authUser?.role !== "admin") {
    return response.status(403).json({ error: "Administrator access is required." });
  }
  next();
}
