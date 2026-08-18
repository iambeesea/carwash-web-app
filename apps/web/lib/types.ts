export type Vehicle = {
  _id: string;
  plateNumber: string;
  model: string;
  type: "sedan" | "suv" | "pickup" | "van" | "motorcycle";
  color?: string;
};

export type Service = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  durationMinutes: number;
  featured: boolean;
  inclusions: string[];
};

export type BookingStatus = "pending" | "confirmed" | "queued" | "washing" | "drying" | "ready" | "completed" | "cancelled" | "no_show";

export type Booking = {
  _id: string;
  bookingCode: string;
  vehicle: Vehicle;
  customer?: { _id: string; name: string; phone?: string; email?: string };
  serviceName: string;
  scheduledAt: string;
  status: BookingStatus;
  source: "online" | "walk_in";
  price: number;
  paidAmount: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  bay?: number;
  loyaltyStampIssued: boolean;
};

export type Capacity = {
  activeCars: number;
  capacity: number;
  availableSlots: number;
  acceptingWalkIns: boolean;
  bays: number;
};
