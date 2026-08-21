import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/washwise"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  DEMO_MODE: z.string().default("true").transform((value) => value === "true"),
  AUTH_JWT_SECRET: z.string().min(32).default("washwise-local-development-secret-only"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_EMAILS: z.string().default(""),
  CLERK_JWKS_URL: z.string().optional(),
  CLERK_ISSUER: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  ADMIN_CLERK_USER_IDS: z.string().default("")
});

export const config = configSchema.parse(process.env);

export const adminUserIds = new Set(
  config.ADMIN_CLERK_USER_IDS.split(",").map((value) => value.trim()).filter(Boolean)
);

export const adminEmails = new Set(
  config.ADMIN_EMAILS.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean)
);
