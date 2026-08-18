import type { Metadata } from "next";
import { AppAuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "WashWise | Car Care, On Your Time",
  description: "Book a wash, skip the line, earn free services, and track every shine.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppAuthProvider>
      <html lang="en">
        <body>
          <SiteHeader />
          {children}
        </body>
      </html>
    </AppAuthProvider>
  );
}
