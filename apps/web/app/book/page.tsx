import { Suspense } from "react";
import { BookingFlow } from "@/components/booking-flow";

export default function BookPage() {
  return <Suspense fallback={<div className="page-loader">Preparing the booking desk…</div>}><BookingFlow /></Suspense>;
}
