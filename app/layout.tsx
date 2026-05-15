import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalHeader from "@/app/components/layout/ConditionalHeader";
import ConditionalBottomNav from "@/app/components/layout/ConditionalBottomNav";
import Providers from "@/app/providers/Providers";
import RequireAuth from "@/app/components/auth/RequireAuth";
import EmailCapturePopup from "@/app/components/EmailCapturePopup";

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  fallback: ["system-ui", "arial"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Chairfill - Contact Management",
  description: "Upload and manage your contacts",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Chairfill - Contact Management",
    description: "Upload and manage your contacts",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        style={{
          fontFamily:
            "var(--font-satoshi), system-ui, -apple-system, sans-serif",
        }}
        suppressHydrationWarning
      >
        <Providers>
          <ConditionalHeader />
          <div className="pb-24 md:pb-0">
            <RequireAuth>{children}</RequireAuth>
          </div>
          <ConditionalBottomNav />
          <EmailCapturePopup />
        </Providers>
      </body>
    </html>
  );
}
