import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { Booking } from "../models/Booking.js";
import { Loyalty } from "../models/Loyalty.js";
import { Service } from "../models/Service.js";
import { Vehicle } from "../models/Vehicle.js";
import { requireAuth } from "../middleware/auth.js";
import { createBookingCode } from "../utils/booking.js";

export const customerRouter = Router();

customerRouter.use(requireAuth);

customerRouter.get("/me", async (request, response, next) => {
  try {
    const [loyalty, vehicleCount, completedWashes] = await Promise.all([
      Loyalty.findOneAndUpdate(
        { customer: request.authUser!._id },
        { $setOnInsert: { customer: request.authUser!._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean(),
      Vehicle.countDocuments({ owner: request.authUser!._id, active: true }),
      Booking.countDocuments({ customer: request.authUser!._id, status: "completed" })
    ]);
    response.json({ user: request.authUser, loyalty, vehicleCount, completedWashes });
  } catch (error) {
    next(error);
  }
});

const vehicleSchema = z.object({
  plateNumber: z.string().trim().min(3).max(12).transform((value) => value.replace(/\s+/g, " ").toUpperCase()),
  model: z.string().trim().min(2).max(80),
  color: z.string().trim().max(40).optional(),
  type: z.enum(["sedan", "suv", "pickup", "van", "motorcycle"])
});

customerRouter.get("/vehicles", async (request, response, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: request.authUser!._id, active: true }).sort({ createdAt: -1 }).lean();
    response.json({ vehicles });
  } catch (error) {
    next(error);
  }
});

customerRouter.post("/vehicles", async (request, response, next) => {
  try {
    const input = vehicleSchema.parse(request.body);
    const vehicle = await Vehicle.create({ ...input, owner: request.authUser!._id });
    response.status(201).json({ vehicle });
  } catch (error) {
    next(error);
  }
});

const bookingInputSchema = z.object({
  vehicleId: z.string().refine(isValidObjectId, "Select a valid vehicle."),
  serviceId: z.string().refine(isValidObjectId, "Select a valid wash package."),
  scheduledAt: z.coerce.date(),
  notes: z.string().trim().max(500).optional()
});

customerRouter.get("/bookings", async (request, response, next) => {
  try {
    const bookings = await Booking.find({ customer: request.authUser!._id })
      .populate("vehicle", "plateNumber model type color")
      .sort({ scheduledAt: -1 })
      .limit(50)
      .lean();
    response.json({ bookings });
  } catch (error) {
    next(error);
  }
});

customerRouter.post("/bookings", async (request, response, next) => {
  try {
    const input = bookingInputSchema.parse(request.body);
    const earliest = new Date(Date.now() + 30 * 60 * 1000);
    if (input.scheduledAt < earliest) {
      return response.status(400).json({ error: "Appointments must be booked at least 30 minutes ahead." });
    }

    const [vehicle, service] = await Promise.all([
      Vehicle.findOne({ _id: input.vehicleId, owner: request.authUser!._id, active: true }),
      Service.findOne({ _id: input.serviceId, active: true })
    ]);
    if (!vehicle || !service) return response.status(404).json({ error: "Vehicle or service was not found." });

    const slotStart = new Date(input.scheduledAt.getTime() - 20 * 60 * 1000);
    const slotEnd = new Date(input.scheduledAt.getTime() + 20 * 60 * 1000);
    const duplicate = await Booking.exists({
      vehicle: vehicle._id,
      scheduledAt: { $gte: slotStart, $lte: slotEnd },
      status: { $nin: ["cancelled", "no_show"] }
    });
    if (duplicate) return response.status(409).json({ error: "This vehicle already has a booking near that time." });

    const booking = await Booking.create({
      bookingCode: createBookingCode(),
      customer: request.authUser!._id,
      vehicle: vehicle._id,
      service: service._id,
      serviceName: service.name,
      scheduledAt: input.scheduledAt,
      status: "confirmed",
      source: "online",
      price: service.price,
      notes: input.notes,
      statusHistory: [{ status: "confirmed", at: new Date(), by: request.authUser!._id }]
    });
    response.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

customerRouter.patch("/bookings/:id/cancel", async (request, response, next) => {
  try {
    const booking = await Booking.findOne({
      _id: request.params.id,
      customer: request.authUser!._id,
      status: { $in: ["pending", "confirmed"] }
    });
    if (!booking) return response.status(404).json({ error: "This booking cannot be cancelled." });
    booking.status = "cancelled";
    booking.statusHistory.push({ status: "cancelled", at: new Date(), by: request.authUser!._id });
    await booking.save();
    response.json({ booking });
  } catch (error) {
    next(error);
  }
});
