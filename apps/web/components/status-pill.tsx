import type { BookingStatus } from "@/lib/types";

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  queued: "In queue",
  washing: "Washing",
  drying: "Drying",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show"
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>;
}
