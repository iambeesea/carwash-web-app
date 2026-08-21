"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { ArrowRight, CarFront, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { hasClerk, hasGoogle, useAppAuth } from "./auth-provider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const render = () => {
      if (!window.google || !buttonRef.current) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onCredential(credential)
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 360
      });
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-washwise-google]");
    if (existing) {
      if (window.google) render();
      else existing.addEventListener("load", render, { once: true });
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.washwiseGoogle = "true";
    script.addEventListener("load", render, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [onCredential]);

  return <div className="google-signin-slot" ref={buttonRef} />;
}

export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const auth = useAppAuth();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function complete(action: () => Promise<{ role: "customer" | "admin" }>) {
    setSaving(true);
    setError("");
    try {
      const user = await action();
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    void complete(() => mode === "sign-up"
      ? auth.signUp(String(form.get("name") || ""), email, password)
      : auth.signIn(email, password));
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
            mode === "sign-in"
              ? <SignIn routing="hash" forceRedirectUrl="/dashboard" />
              : <SignUp routing="hash" forceRedirectUrl="/dashboard" />
          ) : (
            <form className="demo-auth-card auth-form-card" onSubmit={submit}>
              <span className="demo-label">SECURE ACCOUNT</span>
              <h2>{mode === "sign-in" ? "Sign in to continue" : "Create your account"}</h2>
              <p>{mode === "sign-in" ? "Access your real bookings, vehicles, and loyalty record." : "Your account and activity will be securely saved to WashWise."}</p>
              {error ? <div className="form-error" role="alert">{error}</div> : null}
              {mode === "sign-up" ? (
                <label className="auth-field"><span>Full name</span><input name="name" autoComplete="name" minLength={2} required /></label>
              ) : null}
              <label className="auth-field"><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label>
              <label className="auth-field"><span>Password</span><input name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required /></label>
              <button className="button button-dark button-full" type="submit" disabled={saving}>
                {saving ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"} <ArrowRight size={17} />
              </button>
              {hasGoogle ? (
                <><div className="or-divider"><span>or</span></div><GoogleButton onCredential={(credential) => void complete(() => auth.signInWithGoogle(credential))} /></>
              ) : null}
              <small>
                {mode === "sign-in" ? <>New to WashWise? <Link href="/sign-up">Create an account</Link></> : <>Already registered? <Link href="/sign-in">Sign in</Link></>}
              </small>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
