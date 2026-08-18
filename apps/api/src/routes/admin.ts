import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { Booking, bookingStatuses } from "../models/Booking.js";
import { Loyalty } from "../models/Loyalty.js";
import { Service } from "../models/Service.js";
import { Setting } from "../models/Setting.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { activeStatuses, createBookingCode, getCapacityStatus, startOfPeriod } from "../utils/booking.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

async function revenueSince(start: Date) {
  const result = await Booking.aggregate<{ total: number; count: number }>([
    { $match: { paymentStatus: "paid", paidAt: { $gte: start } } },
    { $group: { _id: null, total: { $sum: "$paidAmount" }, count: { $sum: 1 } } }
  ]);
  return result[0] || { total: 0, count: 0 };
}

adminRouter.get("/dashboard", async (_request, response, next) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [week, month, year, capacity, todayBookings, pendingBookings, dailyRevenue, recent] = await Promise.all([
      revenueSince(startOfPeriod("week", now)),
      revenueSince(startOfPeriod("month", now)),
      revenueSince(startOfPeriod("year", now)),
      getCapacityStatus(),
      Booking.countDocuments({ scheduledAt: { $gte: today, $lt: tomorrow }, status: { $ne: "cancelled" } }),
      Booking.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
      Booking.aggregate<{ _id: string; total: number }>([
        { $match: { paymentStatus: "paid", paidAt: { $gte: new Date(now.getTime() - 6 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: "+08:00" } }, total: { $sum: "$paidAmount" } } },
        { $sort: { _id: 1 } }
      ]),
      Booking.find().populate("vehicle", "plateNumber model type color").populate("customer", "name phone").sort({ createdAt: -1 }).limit(8).lean()
    ]);

    response.json({
      revenue: { week, month, year },
      capacity,
      todayBookings,
      pendingBookings,
      dailyRevenue,
      recent
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/queue", async (_request, response, next) => {
  try {
    const [queue, capacity] = await Promise.all([
      Booking.find({ status: { $in: activeStatuses } })
        .populate("vehicle", "plateNumber model type color")
        .populate("customer", "name phone")
        .sort({ updatedAt: 1 })
        .lean(),
      getCapacityStatus()
    ]);
    response.json({ queue, capacity });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/bookings", async (request, response, next) => {
  try {
    const status = typeof request.query.status === "string" ? request.query.status : undefined;
    const filter = status && bookingStatuses.includes(status as (typeof bookingStatuses)[number]) ? { status } : {};
    const bookings = await Booking.find(filter)
      .populate("vehicle", "plateNumber model type color")
      .populate("customer", "name email phone")
      .sort({ scheduledAt: -1 })
      .limit(100)
      .lean();
    response.json({ bookings });
  } catch (error) {
    next(error);
  }
});

const walkInSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional(),
  plateNumber: z.string().trim().min(3).max(12).transform((value) => value.toUpperCase()),
  model: z.string().trim().min(2).max(80),
  vehicleType: z.enum(["sedan", "suv", "pickup", "van", "motorcycle"]),
  serviceId: z.string().refine(isValidObjectId),
  notes: z.string().trim().max(500).optional()
});

adminRouter.post("/walk-ins", async (request, response, next) => {
  try {
    const input = walkInSchema.parse(request.body);
    const [capacity, service] = await Promise.all([getCapacityStatus(), Service.findById(input.serviceId)]);
    if (!capacity.acceptingWalkIns) {
      return response.status(409).json({ error: "The active queue is full or walk-ins are currently paused." });
    }
    if (!service?.active) return response.status(404).json({ error: "Wash package not found." });

    const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const customer = await User.create({
      authId: guestId,
      name: input.customerName,
      phone: input.phone,
      email: "",
      role: "customer",
      isGuest: true
    });
    const vehicle = await Vehicle.create({
      owner: customer._id,
      plateNumber: input.plateNumber,
      model: input.model,
      type: input.vehicleType
    });
    const booking = await Booking.create({
      bookingCode: createBookingCode(),
      customer: customer._id,
      vehicle: vehicle._id,
      service: service._id,
      serviceName: service.name,
      scheduledAt: new Date(),
      status: "queued",
      source: "walk_in",
      price: service.price,
      notes: input.notes,
      statusHistory: [{ status: "queued", at: new Date(), by: request.authUser!._id }]
    });
    const populated = await Booking.findById(booking._id)
      .populate("vehicle", "plateNumber model type color")
      .populate("customer", "name phone")
      .lean();
    response.status(201).json({ booking: populated });
  } catch (error) {
    next(error);
  }
});

const updateStatusSchema = z.object({
  status: z.enum(bookingStatuses),
  bay: z.number().int().positive().optional(),
  paidAmount: z.number().min(0).optional()
});

adminRouter.patch("/bookings/:id/status", async (request, response, next) => {
  try {
    const input = updateStatusSchema.parse(request.body);
    const booking = await Booking.findById(request.params.id);
    if (!booking) return response.status(404).json({ error: "Booking not found." });

    if (input.status === "queued" && !activeStatuses.includes(booking.status as (typeof activeStatuses)[number])) {
      const capacity = await getCapacityStatus();
      if (capacity.availableSlots <= 0) return response.status(409).json({ error: "The active queue is already full." });
    }

    booking.status = input.status;
    if (input.bay) booking.bay = input.bay;
    booking.statusHistory.push({ status: input.status, at: new Date(), by: request.authUser!._id });

    if (input.status === "completed") {
      booking.paymentStatus = "paid";
      booking.paidAmount = input.paidAmount ?? booking.price;
      booking.paidAt ??= new Date();
    }
    await booking.save();
    response.json({ booking });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/bookings/:id/stamp", async (request, response, next) => {
  try {
    const booking = await Booking.findOne({ _id: request.params.id, status: "completed" });
    if (!booking) return response.status(404).json({ error: "Complete the wash before issuing a stamp." });
    if (booking.loyaltyStampIssued) return response.status(409).json({ error: "A stamp was already issued for this wash." });

    const loyalty = await Loyalty.findOneAndUpdate(
      { customer: booking.customer, stampedBookings: { $ne: booking._id } },
      {
        $inc: { stamps: 1, lifetimeStamps: 1 },
        $addToSet: { stampedBookings: booking._id }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    booking.loyaltyStampIssued = true;
    await booking.save();
    response.json({ loyalty, booking });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/customers/:id/redeem", async (request, response, next) => {
  try {
    const loyalty = await Loyalty.findOne({ customer: request.params.id });
    if (!loyalty || loyalty.stamps < 8) return response.status(409).json({ error: "Eight stamps are required for a freebie." });
    loyalty.stamps -= 8;
    loyalty.rewardsRedeemed += 1;
    await loyalty.save();
    response.json({ loyalty });
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.object({
  maxActiveCars: z.number().int().min(1).max(30).optional(),
  bays: z.number().int().min(1).max(20).optional(),
  acceptingWalkIns: z.boolean().optional()
});

adminRouter.patch("/settings", async (request, response, next) => {
  try {
    const input = settingsSchema.parse(request.body);
    const settings = await Setting.findOneAndUpdate(
      { key: "operations" },
      { $set: input, $setOnInsert: { key: "operations" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    response.json({ settings });
  } catch (error) {
    next(error);
  }
});
