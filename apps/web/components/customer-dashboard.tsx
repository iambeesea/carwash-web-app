"use client";

import { ArrowRight, CalendarDays, CarFront, Clock3, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AccountShell } from "./account-shell";
import { useAppAuth } from "./auth-provider";
import { LoyaltyProgress } from "./loyalty-progress";
import { StatusPill } from "./status-pill";
import { apiRequest, type Booking, type CustomerOverview, type Vehicle } from "@/lib/api";
import { currency, dateTime } from "@/lib/format";
import { mockBookings, mockVehicles } from "@/lib/mock-data";

export function CustomerDashboard() {
  const router = useRouter();
  const auth = useAppAuth();
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.isLoaded && !auth.isSignedIn) router.replace("/sign-in");
  }, [auth.isLoaded, auth.isSignedIn, router]);

  useEffect(() => {
    if (!auth.isSignedIn) return;
    const authOptions = { getToken: auth.getToken, demoUserId: auth.isDemo ? auth.user?.id : undefined };
    Promise.all([
      apiRequest<CustomerOverview>("/me", authOptions),
      apiRequest<{ bookings: Booking[] }>("/bookings", authOptions),
      apiRequest<{ vehicles: Vehicle[] }>("/vehicles", authOptions)
    ])
      .then(([profile, bookingData, vehicleData]) => {
        if (profile.user.role === "admin") return router.replace("/admin");
        setOverview(profile);
        setBookings(bookingData.bookings);
        setVehicles(vehicleData.vehicles);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [auth.getToken, auth.isDemo, auth.isSignedIn, auth.user?.id, router]);

  const upcoming = useMemo(
    () => bookings.find((booking) => ["pending", "confirmed", "queued", "washing", "drying", "ready"].includes(booking.status)),
    [bookings]
  );
  const history = bookings.filter((booking) => ["completed", "cancelled", "no_show"].includes(booking.status));

  if (!auth.isLoaded || !auth.isSignedIn) return <div className="page-loader">Loading your account…</div>;

  return (
    <AccountShell>
      <header className="portal-topbar">
        <div><span>CUSTOMER DASHBOARD</span><h1>GOOD DAY, {auth.user?.name.split(" ")[0]?.toUpperCase()}.</h1><p>Your next shine and every past wash, all in one place.</p></div>
        <Link className="button button-yellow" href="/book"><Plus size={17} /> Book a wash</Link>
      </header>

      <section className="portal-content">
        {loading ? <div className="inline-notice">Refreshing your live records…</div> : null}
        <div className="dashboard-grid dashboard-grid-top">
          <article className="dashboard-card upcoming-card">
            <div className="card-heading"><div><span>NEXT APPOINTMENT</span><h3>{upcoming ? upcoming.serviceName : "No wash scheduled"}</h3></div><CalendarDays /></div>
            {upcoming ? (
              <>
                <div className="appointment-date"><strong>{new Date(upcoming.scheduledAt).getDate()}</strong><div><span>{new Date(upcoming.scheduledAt).toLocaleDateString("en-PH", { month: "short" }).toUpperCase()}</span><small>{dateTime.format(new Date(upcoming.scheduledAt))}</small></div><StatusPill status={upcoming.status} /></div>
                <div className="appointment-vehicle"><CarFront /><div><strong>{upcoming.vehicle.model}</strong><span>{upcoming.vehicle.plateNumber}</span></div><span>{currency.format(upcoming.price)}</span></div>
                <div className="wash-track">
                  {[["confirmed", "Booked"], ["queued", "Queue"], ["washing", "Wash"], ["ready", "Ready"]].map(([status, label], index) => {
                    const rank = { pending: 0, confirmed: 0, queued: 1, washing: 2, drying: 2, ready: 3, completed: 4, cancelled: -1, no_show: -1 }[upcoming.status];
                    return <span key={status} className={index <= rank ? "done" : ""}><i />{label}</span>;
                  })}
                </div>
              </>
            ) : (
              <div className="empty-state"><Sparkles /><p>Your calendar is clear. Pick a convenient time for your next wash.</p><Link href="/book">Schedule now <ArrowRight size={16} /></Link></div>
            )}
          </article>
          <LoyaltyProgress stamps={overview?.loyalty.stamps ?? 5} />
          <article className="dashboard-card quick-stats-card">
            <div className="card-heading"><div><span>YOUR GARAGE</span><h3>At a glance</h3></div><CarFront /></div>
            <div className="quick-stat"><strong>{overview?.completedWashes ?? history.filter((item) => item.status === "completed").length}</strong><span>Completed washes</span></div>
            <div className="quick-stat"><strong>{overview?.vehicleCount ?? vehicles.length}</strong><span>Saved vehicles</span></div>
            <div className="quick-stat"><strong>{overview?.loyalty.lifetimeStamps ?? 12}</strong><span>Lifetime stamps</span></div>
          </article>
        </div>

        <div className="dashboard-grid dashboard-grid-bottom">
          <article className="dashboard-card vehicle-card" id="vehicles">
            <div className="card-heading"><div><span>SAVED VEHICLES</span><h3>My garage</h3></div><Link href="/book"><Plus size={17} /> Add</Link></div>
            <div className="vehicle-list">
              {vehicles.map((vehicle, index) => (
                <div className="vehicle-row" key={vehicle._id}>
                  <span className={`vehicle-thumb vehicle-${index % 2}`}><CarFront /></span>
                  <div><strong>{vehicle.model}</strong><span>{vehicle.color || vehicle.type}</span></div>
                  <code>{vehicle.plateNumber}</code>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-card history-card" id="history">
            <div className="card-heading"><div><span>RECENT ACTIVITY</span><h3>Wash history</h3></div><Clock3 /></div>
            <div className="history-list">
              {(history.length ? history : mockBookings.slice(1)).map((booking) => (
                <div className="history-row" key={booking._id}>
                  <span className="history-date">{new Date(booking.scheduledAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                  <div><strong>{booking.serviceName}</strong><span>{booking.vehicle.plateNumber} • {booking.bookingCode}</span></div>
                  <StatusPill status={booking.status} />
                  <strong>{currency.format(booking.paidAmount || booking.price)}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </AccountShell>
  );
}
