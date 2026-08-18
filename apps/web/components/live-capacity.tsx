"use client";

import { CarFront, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { mockCapacity } from "@/lib/mock-data";
import type { Capacity } from "@/lib/types";

export function LiveCapacity() {
  const [capacity, setCapacity] = useState<Capacity>(mockCapacity);

  useEffect(() => {
    apiRequest<Capacity>("/status").then(setCapacity).catch(() => setCapacity(mockCapacity));
  }, []);

  return (
    <div className="live-capacity">
      <div className={`availability-dot ${capacity.acceptingWalkIns ? "is-open" : "is-full"}`} />
      <div>
        <strong>{capacity.acceptingWalkIns ? "Walk-ins welcome" : "Queue currently full"}</strong>
        <span><CarFront size={15} /> {capacity.activeCars} of {capacity.capacity} cars in service</span>
      </div>
      <div className="capacity-wait">
        <Clock3 size={18} />
        <span><small>EST. WAIT</small>{capacity.acceptingWalkIns ? "15–25 min" : "45+ min"}</span>
      </div>
    </div>
  );
}
