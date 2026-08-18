"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppAuth } from "./auth-provider";
import { Logo } from "./logo";

const publicLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#loyalty", label: "Rewards" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isSignedIn, signOut } = useAppAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin") || user?.demoRole === "admin";

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`site-header ${isAdmin ? "admin-header" : ""}`}>
      <div className="header-inner">
        <Logo />
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
        <nav className={`main-nav ${open ? "nav-open" : ""}`} aria-label="Main navigation">
          {isAdmin ? (
            <>
              <Link href="/admin">Overview</Link>
              <Link href="/admin#queue">Live queue</Link>
              <Link href="/admin#appointments">Appointments</Link>
            </>
          ) : (
            publicLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)
          )}
          <div className="nav-actions">
            {isSignedIn ? (
              <>
                <Link className="button button-ghost button-small" href={isAdmin ? "/admin" : "/dashboard"}>
                  {isAdmin ? "Admin panel" : "My account"}
                </Link>
                <button className="button button-yellow button-small" onClick={() => void signOut()}>Sign out</button>
              </>
            ) : (
              <>
                <Link className="button button-ghost button-small" href="/sign-in">Sign in</Link>
                <Link className="button button-yellow button-small" href="/book">Book a wash</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
