import type { Booking, Capacity, Service, Vehicle } from "./types";

export const mockServices: Service[] = [
  {
    _id: "service-express",
    name: "Express Wash",
    slug: "express-wash",
    description: "A fast exterior clean for busy days.",
    price: 250,
    durationMinutes: 25,
    featured: false,
    inclusions: ["Foam wash", "Pressure rinse", "Hand dry", "Tire shine"]
  },
  {
    _id: "service-signature",
    name: "Signature Shine",
    slug: "signature-shine",
    description: "Our complete inside-and-out customer favorite.",
    price: 450,
    durationMinutes: 50,
    featured: true,
    inclusions: ["Exterior wash", "Vacuum", "Dashboard wipe", "Tire shine", "Spray wax"]
  },
  {
    _id: "service-detail",
    name: "Ultimate Detail",
    slug: "ultimate-detail",
    description: "A deeper reset with lasting paint protection.",
    price: 950,
    durationMinutes: 100,
    featured: false,
    inclusions: ["Deep wash", "Interior detail", "Machine wax", "Glass polish", "Engine bay wipe"]
  }
];

export const mockVehicles: Vehicle[] = [
  { _id: "vehicle-1", plateNumber: "NCR 4821", model: "Toyota Vios 2023", type: "sedan", color: "Pearl White" },
  { _id: "vehicle-2", plateNumber: "CAW 9087", model: "Ford Everest 2022", type: "suv", color: "Black" }
];

const tomorrow = new Date(Date.now() + 86400000);
tomorrow.setHours(10, 30, 0, 0);

export const mockBookings: Booking[] = [
  {
    _id: "booking-upcoming",
    bookingCode: "WW-260820-A9F2",
    vehicle: mockVehicles[0]!,
    serviceName: "Signature Shine",
    scheduledAt: tomorrow.toISOString(),
    status: "confirmed",
    source: "online",
    price: 450,
    paidAmount: 0,
    paymentStatus: "unpaid",
    loyaltyStampIssued: false
  },
  {
    _id: "booking-complete",
    bookingCode: "WW-260813-4C21",
    vehicle: mockVehicles[1]!,
    serviceName: "Ultimate Detail",
    scheduledAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: "completed",
    source: "walk_in",
    price: 950,
    paidAmount: 950,
    paymentStatus: "paid",
    loyaltyStampIssued: true
  }
];

export const mockCapacity: Capacity = {
  activeCars: 3,
  capacity: 6,
  availableSlots: 3,
  acceptingWalkIns: true,
  bays: 3
};
