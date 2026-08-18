import { Router } from "express";
import { Service } from "../models/Service.js";
import { getCapacityStatus } from "../utils/booking.js";

export const publicRouter = Router();

publicRouter.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "washwise-api", time: new Date().toISOString() });
});

publicRouter.get("/services", async (_request, response, next) => {
  try {
    const services = await Service.find({ active: true }).sort({ price: 1 }).lean();
    response.json({ services });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/status", async (_request, response, next) => {
  try {
    const status = await getCapacityStatus();
    response.json(status);
  } catch (error) {
    next(error);
  }
});
