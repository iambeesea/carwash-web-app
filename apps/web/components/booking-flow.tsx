"use client";

import { ArrowLeft, ArrowRight, CalendarDays, CarFront, Check, CheckCircle2, Clock3, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppAuth } from "./auth-provider";
import { apiRequest, type Service, type Vehicle } from "@/lib/api";
import { currency } from "@/lib/format";
import { mockServices, mockVehicles } from "@/lib/mock-data";

const vehicleTypes = ["sedan", "suv", "pickup", "van", "motorcycle"] as const;

function localDateTimeMinimum() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function BookingFlow() {
  const auth = useAppAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [serviceId, setServiceId] = useState(searchParams.get("service") || "");
  const [vehicleId, setVehicleId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(localDateTimeMinimum);
  const [notes, setNotes] = useState("");
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<{ code: string; service: string } | null>(null);

  const authOptions = useMemo(() => ({ getToken: auth.getToken, demoUserId: auth.isDemo ? auth.user?.id : undefined }), [auth.getToken, auth.isDemo, auth.user?.id]);

  useEffect(() => {
    if (auth.isLoaded && !auth.isSignedIn) router.replace("/sign-in");
  }, [auth.isLoaded, auth.isSignedIn, router]);

  useEffect(() => {
    if (!auth.isSignedIn) return;
    Promise.all([
      apiRequest<{ services: Service[] }>("/services"),
      apiRequest<{ vehicles: Vehicle[] }>("/vehicles", authOptions)
    ]).then(([serviceData, vehicleData]) => {
      setServices(serviceData.services);
      setVehicles(vehicleData.vehicles);
      setServiceId((current) => current || serviceData.services.find((item) => item.featured)?._id || serviceData.services[0]?._id || "");
      setVehicleId((current) => current || vehicleData.vehicles[0]?._id || "");
      if (!vehicleData.vehicles.length) setShowVehicleForm(true);
    }).catch(() => {
      setServiceId((current) => current || mockServices[1]!._id);
      setVehicleId((current) => current || mockVehicles[0]!._id);
    });
  }, [auth.isSignedIn, authOptions]);

  async function addVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await apiRequest<{ vehicle: Vehicle }>("/vehicles", authOptions, {
        method: "POST",
        body: JSON.stringify({
          plateNumber: form.get("plateNumber"),
          model: form.get("model"),
          color: form.get("color"),
          type: form.get("type")
        })
      });
      setVehicles((current) => [data.vehicle, ...current]);
      setVehicleId(data.vehicle._id);
      setShowVehicleForm(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add vehicle.");
    }
  }

  async function submitBooking() {
    setError("");
    if (!vehicleId || !serviceId) return setError("Select a vehicle and wash package.");
    setSubmitting(true);
    const selectedService = services.find((item) => item._id === serviceId);
    try {
      const data = await apiRequest<{ booking: { bookingCode: string } }>("/bookings", authOptions, {
        method: "POST",
        body: JSON.stringify({ vehicleId, serviceId, scheduledAt: new Date(scheduledAt).toISOString(), notes })
      });
      setConfirmation({ code: data.booking.bookingCode, service: selectedService?.name || "Car wash" });
    } catch (caught) {
      if (auth.isDemo && String(caught).includes("fetch")) {
        setConfirmation({ code: `WW-DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, service: selectedService?.name || "Car wash" });
      } else {
        setError(caught instanceof Error ? caught.message : "Unable to create booking.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!auth.isLoaded || !auth.isSignedIn) return <div className="page-loader">Preparing the booking desk…</div>;

  if (confirmation) {
    return (
      <main className="booking-page booking-confirmed">
        <div className="booking-success-card">
          <span className="success-icon"><CheckCircle2 /></span>
          <span className="kicker">APPOINTMENT CONFIRMED</span>
          <h1>YOU&apos;RE ALL SET.</h1>
          <p>Your {confirmation.service} is scheduled. We&apos;ll keep the live status in your account.</p>
          <div className="confirmation-code"><small>BOOKING CODE</small><strong>{confirmation.code}</strong></div>
          <div className="confirmation-actions"><Link className="button button-yellow" href="/dashboard">View my dashboard</Link><Link className="button button-outline" href="/">Back home</Link></div>
        </div>
      </main>
    );
  }

  const selectedService = services.find((service) => service._id === serviceId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle._id === vehicleId);

  return (
    <main className="booking-page">
      <div className="booking-heading container">
        <Link href="/dashboard"><ArrowLeft size={17} /> Back to dashboard</Link>
        <span className="kicker">BOOK YOUR WASH</span>
        <h1>WHEN SHOULD WE<br /><em>MAKE IT SHINE?</em></h1>
        <p>Choose your vehicle, package, and preferred arrival time.</p>
      </div>

      <div className="booking-layout container">
        <div className="booking-form-column">
          <section className="booking-step">
            <div className="step-title"><span>01</span><div><h2>Choose your vehicle</h2><p>We use the plate and model for check-in and wash records.</p></div></div>
            <div className="vehicle-choice-grid">
              {vehicles.map((vehicle) => (
                <button type="button" key={vehicle._id} className={`vehicle-choice ${vehicleId === vehicle._id ? "selected" : ""}`} onClick={() => { setVehicleId(vehicle._id); setShowVehicleForm(false); }}>
                  <CarFront /><div><strong>{vehicle.model}</strong><span>{vehicle.color || vehicle.type}</span><code>{vehicle.plateNumber}</code></div>{vehicleId === vehicle._id ? <Check /> : null}
                </button>
              ))}
              <button type="button" className="vehicle-choice add-vehicle-choice" onClick={() => setShowVehicleForm((value) => !value)}><Plus /><span>Add another vehicle</span></button>
            </div>
            {showVehicleForm ? (
              <form className="inline-vehicle-form" onSubmit={addVehicle}>
                <label><span>Plate number</span><input required name="plateNumber" placeholder="e.g. NCR 4821" /></label>
                <label><span>Car model</span><input required name="model" placeholder="e.g. Toyota Vios 2023" /></label>
                <label><span>Color</span><input name="color" placeholder="e.g. Pearl White" /></label>
                <label><span>Vehicle type</span><select name="type">{vehicleTypes.map((type) => <option key={type} value={type}>{type[0]?.toUpperCase()}{type.slice(1)}</option>)}</select></label>
                <button className="button button-dark" type="submit">Save vehicle</button>
              </form>
            ) : null}
          </section>

          <section className="booking-step">
            <div className="step-title"><span>02</span><div><h2>Pick a wash package</h2><p>All pricing is shown before you confirm.</p></div></div>
            <div className="package-choice-list">
              {services.map((service) => (
                <label key={service._id} className={`package-choice ${serviceId === service._id ? "selected" : ""}`}>
                  <input type="radio" name="service" value={service._id} checked={serviceId === service._id} onChange={() => setServiceId(service._id)} />
                  <span className="package-radio" />
                  <div><strong>{service.name}</strong><p>{service.description}</p><span><Clock3 size={15} /> {service.durationMinutes} minutes</span></div>
                  <strong>{currency.format(service.price)}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="booking-step">
            <div className="step-title"><span>03</span><div><h2>Choose date & time</h2><p>Appointments require at least 30 minutes&apos; notice.</p></div></div>
            <div className="date-time-field"><CalendarDays /><label><span>Arrival date and time</span><input type="datetime-local" min={localDateTimeMinimum()} value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required /></label></div>
            <label className="notes-field"><span>Notes for the team <small>(optional)</small></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} placeholder="Special requests, areas to focus on, etc." /></label>
          </section>
          {error ? <div className="form-error">{error}</div> : null}
        </div>

        <aside className="booking-summary">
          <span className="kicker kicker-dark">YOUR BOOKING</span>
          <h2>Wash summary</h2>
          <div className="summary-visual"><Sparkles /><CarFront /></div>
          <dl>
            <div><dt>Vehicle</dt><dd>{selectedVehicle?.model || "Select a vehicle"}<small>{selectedVehicle?.plateNumber}</small></dd></div>
            <div><dt>Package</dt><dd>{selectedService?.name || "Select a package"}<small>{selectedService ? `${selectedService.durationMinutes} minutes` : ""}</small></dd></div>
            <div><dt>Schedule</dt><dd>{scheduledAt ? new Date(scheduledAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Select a time"}</dd></div>
          </dl>
          <div className="summary-total"><span>Total</span><strong>{selectedService ? currency.format(selectedService.price) : "—"}</strong></div>
          <button type="button" className="button button-yellow button-full button-large" disabled={submitting} onClick={() => void submitBooking()}>{submitting ? "Confirming…" : <>Confirm booking <ArrowRight size={18} /></>}</button>
          <p className="secure-note"><ShieldCheck /> No online payment required. Pay after your wash.</p>
        </aside>
      </div>
    </main>
  );
}
