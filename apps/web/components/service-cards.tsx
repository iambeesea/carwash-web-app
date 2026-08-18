"use client";

import { Check, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { currency } from "@/lib/format";
import { mockServices } from "@/lib/mock-data";
import type { Service } from "@/lib/types";

export function ServiceCards() {
  const [services, setServices] = useState<Service[]>(mockServices);
  useEffect(() => {
    apiRequest<{ services: Service[] }>("/services").then((data) => setServices(data.services)).catch(() => undefined);
  }, []);

  return (
    <div className="service-grid">
      {services.map((service, index) => (
        <article className={`service-card ${service.featured ? "service-featured" : ""}`} key={service._id}>
          {service.featured ? <span className="popular-tag">Most popular</span> : null}
          <span className="service-number">0{index + 1}</span>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <div className="service-price"><strong>{currency.format(service.price)}</strong><span><Clock3 size={15} /> {service.durationMinutes} min</span></div>
          <ul>
            {service.inclusions.slice(0, 4).map((item) => <li key={item}><Check size={16} /> {item}</li>)}
          </ul>
          <Link className={`button ${service.featured ? "button-dark" : "button-outline"}`} href={`/book?service=${service._id}`}>Choose this wash</Link>
        </article>
      ))}
    </div>
  );
}
