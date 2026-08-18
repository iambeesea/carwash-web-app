"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { ArrowRight, CarFront, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { hasClerk, useAppAuth } from "./auth-provider";

export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const { demoSignIn } = useAppAuth();

  function enterDemo(role: "customer" | "admin") {
    demoSignIn(role);
    router.push(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-side">
        <div className="auth-side-inner">
          <span className="kicker kicker-dark">WELCOME TO WASHWISE</span>
          <h1>{mode === "sign-in" ? "GOOD TO SEE\nYOU AGAIN." : "ONE ACCOUNT.\nEVERY SHINE."}</h1>
          <p>Keep every vehicle, booking, wash record, and loyalty stamp in one simple place.</p>
          <ul>
            <li><CheckCircle2 /> Schedule without calling</li>
            <li><CarFront /> See your car&apos;s wash status</li>
            <li><ShieldCheck /> Keep a verified service history</li>
          </ul>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-shell">
          {hasClerk ? (
            mode === "sign-in" ? <SignIn routing="hash" forceRedirectUrl="/dashboard" /> : <SignUp routing="hash" forceRedirectUrl="/dashboard" />
          ) : (
            <div className="demo-auth-card">
              <span className="demo-label">INTERACTIVE DEMO</span>
              <h2>{mode === "sign-in" ? "Sign in to continue" : "Create your account"}</h2>
              <p>Google and email sign-in activate when Clerk credentials are added. Explore the complete interface now.</p>
              <button className="google-button" onClick={() => enterDemo("customer")}>
                <span className="google-g">G</span> Continue as customer <ArrowRight size={17} />
              </button>
              <div className="or-divider"><span>or</span></div>
              <button className="button button-dark button-full" onClick={() => enterDemo("admin")}>Open admin demo</button>
              <small>Demo data is sample-only. Production authentication uses Google through Clerk.</small>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
