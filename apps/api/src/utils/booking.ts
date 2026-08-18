import { randomBytes } from "node:crypto";
import { Booking } from "../models/Booking.js";
import { Setting } from "../models/Setting.js";

export const activeStatuses = ["queued", "washing", "drying", "ready"] as const;

export function createBookingCode() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `WW-${date}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function getCapacityStatus() {
  const [settings, activeCars] = await Promise.all([
    Setting.findOneAndUpdate(
      { key: "operations" },
      { $setOnInsert: { key: "operations" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean(),
    Booking.countDocuments({ status: { $in: activeStatuses } })
  ]);

  const capacity = settings?.maxActiveCars ?? 6;
  const availableSlots = Math.max(0, capacity - activeCars);
  return {
    activeCars,
    capacity,
    availableSlots,
    acceptingWalkIns: Boolean(settings?.acceptingWalkIns && availableSlots > 0),
    bays: settings?.bays ?? 3
  };
}

export function startOfPeriod(period: "week" | "month" | "year", now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "week") {
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  } else if (period === "month") {
    start.setDate(1);
  } else {
    start.setMonth(0, 1);
  }
  return start;
}
