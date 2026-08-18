import { Schema, model, type Types } from "mongoose";

export const bookingStatuses = [
  "pending",
  "confirmed",
  "queued",
  "washing",
  "drying",
  "ready",
  "completed",
  "cancelled",
  "no_show"
] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export interface IStatusEvent {
  status: BookingStatus;
  at: Date;
  by?: Types.ObjectId;
}

export interface IBooking {
  bookingCode: string;
  customer: Types.ObjectId;
  vehicle: Types.ObjectId;
  service: Types.ObjectId;
  serviceName: string;
  scheduledAt: Date;
  status: BookingStatus;
  source: "online" | "walk_in";
  price: number;
  paidAmount: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paidAt?: Date;
  bay?: number;
  notes?: string;
  loyaltyStampIssued: boolean;
  statusHistory: IStatusEvent[];
}

const statusEventSchema = new Schema<IStatusEvent>(
  {
    status: { type: String, enum: bookingStatuses, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    status: { type: String, enum: bookingStatuses, default: "pending", index: true },
    source: { type: String, enum: ["online", "walk_in"], default: "online" },
    price: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paidAt: Date,
    bay: { type: Number, min: 1 },
    notes: { type: String, trim: true, maxlength: 500 },
    loyaltyStampIssued: { type: Boolean, default: false },
    statusHistory: { type: [statusEventSchema], default: [] }
  },
  { timestamps: true }
);

bookingSchema.index({ scheduledAt: 1, status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
