import { Service } from "../models/Service.js";
import { Setting } from "../models/Setting.js";

const defaultServices = [
  {
    name: "Express Wash",
    slug: "express-wash",
    description: "A fast exterior clean for busy days.",
    price: 250,
    durationMinutes: 25,
    featured: false,
    inclusions: ["Foam wash", "Pressure rinse", "Hand dry", "Tire shine"]
  },
  {
    name: "Signature Shine",
    slug: "signature-shine",
    description: "Our complete inside-and-out customer favorite.",
    price: 450,
    durationMinutes: 50,
    featured: true,
    inclusions: ["Exterior wash", "Vacuum", "Dashboard wipe", "Tire shine", "Spray wax"]
  },
  {
    name: "Ultimate Detail",
    slug: "ultimate-detail",
    description: "A deeper reset with lasting paint protection.",
    price: 950,
    durationMinutes: 100,
    featured: false,
    inclusions: ["Deep wash", "Interior detail", "Machine wax", "Glass polish", "Engine bay wipe"]
  }
];

export async function seedDefaults() {
  await Promise.all(
    defaultServices.map((service) =>
      Service.updateOne({ slug: service.slug }, { $setOnInsert: service }, { upsert: true })
    )
  );
  await Setting.updateOne(
    { key: "operations" },
    { $setOnInsert: { key: "operations", maxActiveCars: 6, bays: 3, acceptingWalkIns: true } },
    { upsert: true }
  );
}
