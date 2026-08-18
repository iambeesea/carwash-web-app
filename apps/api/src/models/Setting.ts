import { Schema, model } from "mongoose";

export interface ISetting {
  key: "operations";
  maxActiveCars: number;
  bays: number;
  acceptingWalkIns: boolean;
  openHour: number;
  closeHour: number;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, enum: ["operations"], unique: true, default: "operations" },
    maxActiveCars: { type: Number, default: 6, min: 1, max: 30 },
    bays: { type: Number, default: 3, min: 1, max: 20 },
    acceptingWalkIns: { type: Boolean, default: true },
    openHour: { type: Number, default: 8, min: 0, max: 23 },
    closeHour: { type: Number, default: 18, min: 1, max: 24 }
  },
  { timestamps: true }
);

export const Setting = model<ISetting>("Setting", settingSchema);
