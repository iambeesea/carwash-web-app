import { Schema, model, type Types } from "mongoose";

export interface ILoyalty {
  customer: Types.ObjectId;
  stamps: number;
  lifetimeStamps: number;
  rewardsRedeemed: number;
  stampedBookings: Types.ObjectId[];
}

const loyaltySchema = new Schema<ILoyalty>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    stamps: { type: Number, default: 0, min: 0, max: 8 },
    lifetimeStamps: { type: Number, default: 0, min: 0 },
    rewardsRedeemed: { type: Number, default: 0, min: 0 },
    stampedBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }]
  },
  { timestamps: true }
);

export const Loyalty = model<ILoyalty>("Loyalty", loyaltySchema);
