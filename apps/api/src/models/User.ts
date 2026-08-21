import { Schema, model } from "mongoose";

export type UserRole = "customer" | "admin";

export interface IUser {
  authId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash?: string;
  googleSubject?: string;
  role: UserRole;
  phone?: string;
  isGuest: boolean;
}

const userSchema = new Schema<IUser>(
  {
    authId: { type: String, required: true, unique: true, index: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    name: { type: String, required: true, trim: true },
    avatarUrl: String,
    passwordHash: { type: String, select: false },
    googleSubject: { type: String, unique: true, sparse: true, index: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    phone: { type: String, trim: true },
    isGuest: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string", $gt: "" } } }
);

export const User = model<IUser>("User", userSchema);
