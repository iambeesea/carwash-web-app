import { Schema, model, type Types } from "mongoose";

export type VehicleType = "sedan" | "suv" | "pickup" | "van" | "motorcycle";

export interface IVehicle {
  owner: Types.ObjectId;
  plateNumber: string;
  model: string;
  color?: string;
  type: VehicleType;
  active: boolean;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true },
    model: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    type: {
      type: String,
      enum: ["sedan", "suv", "pickup", "van", "motorcycle"],
      default: "sedan"
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

vehicleSchema.index({ owner: 1, plateNumber: 1 }, { unique: true });

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
