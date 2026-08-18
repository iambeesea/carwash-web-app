import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: HydratedDocument<IUser>;
      authId?: string;
    }
  }
}

export {};
