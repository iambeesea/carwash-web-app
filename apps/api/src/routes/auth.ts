import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { adminEmails } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { User, type IUser } from "../models/User.js";
import { createSessionToken, hashPassword, verifyGoogleCredential, verifyPassword } from "../utils/auth.js";

export const authRouter = Router();

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const passwordSchema = z.string()
  .min(8, "Password must have at least 8 characters.")
  .max(128)
  .regex(/[A-Za-z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema
});

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
const googleSchema = z.object({ credential: z.string().min(20) });

function publicUser(user: IUser & { _id: unknown }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    imageUrl: user.avatarUrl,
    role: user.role
  };
}

authRouter.post("/auth/register", async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    if (await User.exists({ email: input.email })) {
      return response.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
      authId: `local:${randomUUID()}`,
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: adminEmails.has(input.email) ? "admin" : "customer",
      isGuest: false
    });
    const token = await createSessionToken(user.authId);
    response.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/auth/login", async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
      return response.status(401).json({ error: "Incorrect email or password." });
    }

    const token = await createSessionToken(user.authId);
    response.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/auth/google", async (request, response, next) => {
  try {
    const { credential } = googleSchema.parse(request.body);
    const profile = await verifyGoogleCredential(credential);
    const email = profile.email.toLowerCase();
    let user = await User.findOne({ $or: [{ googleSubject: profile.sub }, { email }] });

    if (user) {
      user.googleSubject = profile.sub;
      user.name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : user.name;
      user.avatarUrl = typeof profile.picture === "string" ? profile.picture : user.avatarUrl;
      if (adminEmails.has(email)) user.role = "admin";
      await user.save();
    } else {
      user = await User.create({
        authId: `google:${profile.sub}`,
        googleSubject: profile.sub,
        email,
        name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : email.split("@")[0],
        avatarUrl: typeof profile.picture === "string" ? profile.picture : undefined,
        role: adminEmails.has(email) ? "admin" : "customer",
        isGuest: false
      });
    }

    const token = await createSessionToken(user.authId);
    response.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/auth/me", requireAuth, (request, response) => {
  response.json({ user: publicUser(request.authUser!) });
});
