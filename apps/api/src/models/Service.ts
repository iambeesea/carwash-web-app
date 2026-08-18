import { Schema, model } from "mongoose";

export interface IService {
  name: string;
  slug: string;
  description: string;
  price: number;
  durationMinutes: number;
  featured: boolean;
  active: boolean;
  inclusions: string[];
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5 },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    inclusions: [{ type: String }]
  },
  { timestamps: true }
);

export const Service = model<IService>("Service", serviceSchema);
