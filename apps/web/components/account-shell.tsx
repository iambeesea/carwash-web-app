"use client";

import { CalendarPlus, CarFront, Gauge, History, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppAuth } from "./auth-provider";
import { Logo } from "./logo";

export function AccountShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const pathname = usePathname();
  const { user, signOut } = useAppAuth();
  const links = admin
    ? [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin#queue", label: "Live queue", icon: Gauge },
        { href: "/admin#appointments", label: "Appointments", icon: CalendarPlus },
        { href: "/admin#settings", label: "Operations", icon: Settings }
      ]
    : [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/book", label: "Book a wash", icon: CalendarPlus },
        { href: "/dashboard#vehicles", label: "My vehicles", icon: CarFront },
        { href: "/dashboard#history", label: "Wash history", icon: History }
      ];

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <Logo />
        <div className="portal-account-type">{admin ? "ADMIN CONSOLE" : "CUSTOMER PORTAL"}</div>
        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon size={19} /> {label}</Link>
          ))}
        </nav>
        <button className="sidebar-signout" onClick={() => void signOut()}><LogOut size={18} /> Sign out</button>
        <div className="sidebar-user"><span>{user?.name?.slice(0, 1) || "W"}</span><div><strong>{user?.name}</strong><small>{admin ? "Administrator" : "Shine Club member"}</small></div></div>
      </aside>
      <div className="portal-main">{children}</div>
    </div>
  );
}
