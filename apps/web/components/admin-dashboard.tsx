"use client";

import { Banknote, CalendarCheck, CarFront, ChevronRight, CircleDollarSign, Gauge, MoreHorizontal, Plus, Settings2, TrendingUp, Users, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountShell } from "./account-shell";
import { useAppAuth } from "./auth-provider";
import { StatusPill } from "./status-pill";
import { apiRequest, type AdminDashboardData, type Booking, type Capacity, type Service, type Vehicle } from "@/lib/api";
import { currency, dateTime } from "@/lib/format";
import { mockCapacity, mockServices, mockVehicles } from "@/lib/mock-data";

const queueStatuses: Booking["status"][] = ["queued", "washing", "drying", "ready"];

const mockQueue: Booking[] = [
  { _id: "q1", bookingCode: "WW-260819-A1", customer: { _id: "u1", name: "Marco Reyes", phone: "09171234567" }, vehicle: { ...mockVehicles[0]!, plateNumber: "NDR 2481" }, serviceName: "Signature Shine", scheduledAt: new Date(Date.now() - 32 * 60000).toISOString(), status: "washing", source: "walk_in", price: 450, paidAmount: 0, paymentStatus: "unpaid", bay: 1, loyaltyStampIssued: false },
  { _id: "q2", bookingCode: "WW-260819-B2", customer: { _id: "u2", name: "Ana Santos" }, vehicle: { ...mockVehicles[1]!, plateNumber: "CAW 9087" }, serviceName: "Ultimate Detail", scheduledAt: new Date(Date.now() - 18 * 60000).toISOString(), status: "drying", source: "online", price: 950, paidAmount: 0, paymentStatus: "unpaid", bay: 2, loyaltyStampIssued: false },
  { _id: "q3", bookingCode: "WW-260819-C3", customer: { _id: "u3", name: "Leo Garcia" }, vehicle: { ...mockVehicles[0]!, plateNumber: "NCK 4420", model: "Honda City 2021" }, serviceName: "Express Wash", scheduledAt: new Date(Date.now() - 8 * 60000).toISOString(), status: "queued", source: "walk_in", price: 250, paidAmount: 0, paymentStatus: "unpaid", loyaltyStampIssued: false }
];

const mockDashboard: AdminDashboardData = {
  revenue: { week: { total: 18450, count: 39 }, month: { total: 72800, count: 156 }, year: { total: 624900, count: 1380 } },
  capacity: mockCapacity,
  todayBookings: 14,
  pendingBookings: 5,
  dailyRevenue: [
    { _id: "Mon", total: 2100 }, { _id: "Tue", total: 3400 }, { _id: "Wed", total: 2800 },
    { _id: "Thu", total: 4200 }, { _id: "Fri", total: 3650 }, { _id: "Sat", total: 5100 }, { _id: "Sun", total: 2600 }
  ],
  recent: mockQueue
};

export function AdminDashboard() {
  const auth = useAppAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AdminDashboardData>(mockDashboard);
  const [queue, setQueue] = useState<Booking[]>(mockQueue);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const authOptions = useMemo(() => ({ getToken: auth.getToken, demoUserId: auth.isDemo ? auth.user?.id : undefined }), [auth.getToken, auth.isDemo, auth.user?.id]);

  useEffect(() => {
    if (auth.isLoaded && !auth.isSignedIn) router.replace("/sign-in");
    if (auth.user?.demoRole === "customer") router.replace("/dashboard");
  }, [auth.isLoaded, auth.isSignedIn, auth.user?.demoRole, router]);

  useEffect(() => {
    if (!auth.isSignedIn) return;
    Promise.all([
      apiRequest<AdminDashboardData>("/admin/dashboard", authOptions),
      apiRequest<{ queue: Booking[]; capacity: Capacity }>("/admin/queue", authOptions),
      apiRequest<{ services: Service[] }>("/services")
    ]).then(([dashboardData, queueData, serviceData]) => {
      setDashboard(dashboardData);
      setQueue(queueData.queue);
      setServices(serviceData.services);
    }).catch(() => undefined);
  }, [auth.isSignedIn, authOptions]);

  const chartMax = Math.max(...dashboard.dailyRevenue.map((day) => day.total), 1);

  async function advanceBooking(booking: Booking) {
    const nextStatus: Partial<Record<Booking["status"], Booking["status"]>> = { queued: "washing", washing: "drying", drying: "ready", ready: "completed" };
    const status = nextStatus[booking.status];
    if (!status) return;
    setMessage("");
    try {
      await apiRequest(`/admin/bookings/${booking._id}/status`, authOptions, { method: "PATCH", body: JSON.stringify({ status, paidAmount: status === "completed" ? booking.price : undefined }) });
      setQueue((current) => status === "completed" ? current.filter((item) => item._id !== booking._id) : current.map((item) => item._id === booking._id ? { ...item, status } : item));
      setMessage(`${booking.vehicle.plateNumber} moved to ${status}.`);
    } catch (caught) {
      if (auth.isDemo) {
        setQueue((current) => status === "completed" ? current.filter((item) => item._id !== booking._id) : current.map((item) => item._id === booking._id ? { ...item, status } : item));
        setMessage(`Demo: ${booking.vehicle.plateNumber} moved to ${status}.`);
      } else setMessage(caught instanceof Error ? caught.message : "Unable to update booking.");
    }
  }

  async function addWalkIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    try {
      const data = await apiRequest<{ booking: Booking }>("/admin/walk-ins", authOptions, {
        method: "POST",
        body: JSON.stringify({
          customerName: form.get("customerName"), phone: form.get("phone"), plateNumber: form.get("plateNumber"),
          model: form.get("model"), vehicleType: form.get("vehicleType"), serviceId: form.get("serviceId"), notes: form.get("notes")
        })
      });
      setQueue((current) => [...current, data.booking]);
      setWalkInOpen(false);
      setMessage(`${data.booking.vehicle.plateNumber} was added to the queue.`);
    } catch (caught) {
      if (auth.isDemo) {
        const service = services.find((item) => item._id === form.get("serviceId")) || services[0]!;
        const booking: Booking = {
          _id: `demo-${Date.now()}`, bookingCode: `WW-DEMO-${Date.now().toString().slice(-4)}`,
          customer: { _id: "guest", name: String(form.get("customerName")) },
          vehicle: { _id: `vehicle-${Date.now()}`, plateNumber: String(form.get("plateNumber")).toUpperCase(), model: String(form.get("model")), type: form.get("vehicleType") as Vehicle["type"] },
          serviceName: service.name, scheduledAt: new Date().toISOString(), status: "queued", source: "walk_in", price: service.price, paidAmount: 0, paymentStatus: "unpaid", loyaltyStampIssued: false
        };
        setQueue((current) => [...current, booking]); setWalkInOpen(false); setMessage(`${booking.vehicle.plateNumber} was added in demo mode.`);
      } else setMessage(caught instanceof Error ? caught.message : "Unable to add walk-in.");
    } finally { setSaving(false); }
  }

  async function updateCapacity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextCapacity = Number(form.get("maxActiveCars"));
    const acceptingWalkIns = form.get("acceptingWalkIns") === "on";
    try {
      await apiRequest("/admin/settings", authOptions, { method: "PATCH", body: JSON.stringify({ maxActiveCars: nextCapacity, acceptingWalkIns }) });
      setDashboard((current) => ({ ...current, capacity: { ...current.capacity, capacity: nextCapacity, availableSlots: Math.max(0, nextCapacity - current.capacity.activeCars), acceptingWalkIns } }));
      setSettingsOpen(false); setMessage("Operations settings updated.");
    } catch (caught) {
      if (auth.isDemo) { setDashboard((current) => ({ ...current, capacity: { ...current.capacity, capacity: nextCapacity, availableSlots: Math.max(0, nextCapacity - current.capacity.activeCars), acceptingWalkIns } })); setSettingsOpen(false); setMessage("Demo operations settings updated."); }
      else setMessage(caught instanceof Error ? caught.message : "Unable to save settings.");
    }
  }

  if (!auth.isLoaded || !auth.isSignedIn) return <div className="page-loader">Opening the operations console…</div>;

  return (
    <AccountShell admin>
      <header className="portal-topbar admin-topbar">
        <div><span>OPERATIONS OVERVIEW</span><h1>THE SHOP AT A GLANCE.</h1><p>Live queue, revenue, appointments, and service flow.</p></div>
        <div className="topbar-actions"><button className="button button-ghost" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /> Capacity</button><button className="button button-yellow" onClick={() => setWalkInOpen(true)} disabled={!dashboard.capacity.acceptingWalkIns}><Plus size={17} /> Add walk-in</button></div>
      </header>

      <section className="portal-content admin-content">
        {message ? <div className="admin-toast">{message}<button onClick={() => setMessage("")}><X size={15} /></button></div> : null}
        <div className="revenue-grid">
          <article className="metric-card metric-primary"><span><Banknote /> THIS WEEK</span><strong>{currency.format(dashboard.revenue.week.total)}</strong><small>{dashboard.revenue.week.count} completed washes <TrendingUp size={14} /> +12.4%</small></article>
          <article className="metric-card"><span><CircleDollarSign /> THIS MONTH</span><strong>{currency.format(dashboard.revenue.month.total)}</strong><small>{dashboard.revenue.month.count} completed washes</small></article>
          <article className="metric-card"><span><TrendingUp /> THIS YEAR</span><strong>{currency.format(dashboard.revenue.year.total)}</strong><small>{dashboard.revenue.year.count} completed washes</small></article>
          <article className={`metric-card capacity-metric ${dashboard.capacity.acceptingWalkIns ? "capacity-open" : "capacity-full"}`}><span><Gauge /> LIVE CAPACITY</span><strong>{dashboard.capacity.activeCars}<i>/{dashboard.capacity.capacity}</i></strong><small>{dashboard.capacity.acceptingWalkIns ? `${dashboard.capacity.availableSlots} slots • Accepting walk-ins` : "Queue full • Walk-ins paused"}</small></article>
        </div>

        <div className="admin-overview-grid">
          <article className="dashboard-card revenue-chart-card">
            <div className="card-heading"><div><span>REVENUE PULSE</span><h3>Last 7 days</h3></div><strong>{currency.format(dashboard.dailyRevenue.reduce((total, day) => total + day.total, 0))}</strong></div>
            <div className="bar-chart" aria-label="Daily revenue bar chart">
              {dashboard.dailyRevenue.map((day) => <div className="bar-column" key={day._id}><span className="bar-value">{day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}k` : day.total}</span><i style={{ height: `${Math.max(8, (day.total / chartMax) * 100)}%` }} /><small>{day._id.length > 3 ? new Date(day._id).toLocaleDateString("en-PH", { weekday: "short" }) : day._id}</small></div>)}
            </div>
          </article>
          <article className="dashboard-card today-card">
            <div className="card-heading"><div><span>TODAY&apos;S LOAD</span><h3>Service desk</h3></div><CalendarCheck /></div>
            <div className="today-stat"><Users /><div><strong>{dashboard.todayBookings}</strong><span>Bookings today</span></div></div>
            <div className="today-stat"><CarFront /><div><strong>{queue.length}</strong><span>Cars active now</span></div></div>
            <div className="today-stat"><MoreHorizontal /><div><strong>{dashboard.pendingBookings}</strong><span>Awaiting check-in</span></div></div>
          </article>
        </div>

        <article className="dashboard-card queue-card" id="queue">
          <div className="card-heading queue-heading"><div><span>LIVE SERVICE FLOOR</span><h3>Cars in the queue</h3></div><div className={`queue-open-indicator ${dashboard.capacity.acceptingWalkIns ? "open" : ""}`}><i /> {dashboard.capacity.acceptingWalkIns ? "OPEN FOR WALK-INS" : "AT CAPACITY"}</div></div>
          <div className="queue-table table-scroll">
            <div className="table-header"><span>Vehicle</span><span>Customer</span><span>Service</span><span>Stage</span><span>Bay</span><span>Action</span></div>
            {queue.length ? queue.map((booking) => (
              <div className="table-row" key={booking._id}>
                <span className="vehicle-cell"><i><CarFront /></i><b>{booking.vehicle.model}<small>{booking.vehicle.plateNumber}</small></b></span>
                <span><b>{booking.customer?.name || "Walk-in customer"}</b><small>{booking.source === "walk_in" ? "Walk-in" : "Appointment"}</small></span>
                <span><b>{booking.serviceName}</b><small>{currency.format(booking.price)}</small></span>
                <span><StatusPill status={booking.status} /></span>
                <span><b>{booking.bay ? `Bay ${booking.bay}` : "Waiting"}</b></span>
                <span><button className="advance-button" onClick={() => void advanceBooking(booking)}>{booking.status === "ready" ? "Complete" : "Advance"}<ChevronRight size={16} /></button></span>
              </div>
            )) : <div className="empty-table">No active cars. The next walk-in can be accepted.</div>}
          </div>
        </article>

        <article className="dashboard-card appointments-card" id="appointments">
          <div className="card-heading"><div><span>LATEST RECORDS</span><h3>Recent appointments & walk-ins</h3></div><CalendarCheck /></div>
          <div className="compact-records">
            {dashboard.recent.map((booking) => <div key={booking._id}><code>{booking.vehicle?.plateNumber}</code><span><strong>{booking.vehicle?.model}</strong><small>{booking.customer?.name || "Customer"} • {dateTime.format(new Date(booking.scheduledAt))}</small></span><StatusPill status={booking.status} /><strong>{currency.format(booking.price)}</strong></div>)}
          </div>
        </article>
      </section>

      {walkInOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setWalkInOpen(false)}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="walk-in-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setWalkInOpen(false)}><X /></button>
            <span className="kicker">NEW WALK-IN</span><h2 id="walk-in-title">Add car to queue</h2><p>Plate number and model become part of the permanent wash record.</p>
            <form className="modal-form" onSubmit={addWalkIn}>
              <label><span>Customer name</span><input name="customerName" required placeholder="Full name" /></label>
              <label><span>Mobile number</span><input name="phone" placeholder="09XX XXX XXXX" /></label>
              <label><span>Plate number</span><input name="plateNumber" required placeholder="NCR 4821" /></label>
              <label><span>Car model</span><input name="model" required placeholder="Toyota Vios 2023" /></label>
              <label><span>Vehicle type</span><select name="vehicleType">{["sedan", "suv", "pickup", "van", "motorcycle"].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
              <label><span>Wash package</span><select name="serviceId">{services.map((service) => <option key={service._id} value={service._id}>{service.name} — {currency.format(service.price)}</option>)}</select></label>
              <label className="modal-full"><span>Notes</span><textarea name="notes" placeholder="Optional service notes" /></label>
              <button className="button button-yellow button-full modal-full" disabled={saving}>{saving ? "Adding…" : "Add to live queue"}</button>
            </form>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSettingsOpen(false)}>
          <div className="modal-panel modal-small" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSettingsOpen(false)}><X /></button><span className="kicker">OPERATIONS</span><h2 id="settings-title">Queue capacity</h2><p>Control how many active cars the team can safely handle.</p>
            <form className="settings-form" onSubmit={updateCapacity}>
              <label><span>Maximum active cars</span><input name="maxActiveCars" type="number" min="1" max="30" defaultValue={dashboard.capacity.capacity} /></label>
              <label className="toggle-label"><span><strong>Accept walk-ins</strong><small>Turn off during heavy appointment volume.</small></span><input name="acceptingWalkIns" type="checkbox" defaultChecked={dashboard.capacity.acceptingWalkIns} /></label>
              <button className="button button-yellow button-full">Save capacity</button>
            </form>
          </div>
        </div>
      ) : null}
    </AccountShell>
  );
}
