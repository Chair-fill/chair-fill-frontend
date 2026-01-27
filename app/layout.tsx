import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import { ContactsProvider } from "./context/ContactsContext";

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
  title: "Chairfill - Contact Management",
  description: "Upload and manage your contacts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: 'var(--font-satoshi), system-ui, -apple-system, sans-serif' }}
      >
        <ContactsProvider>
          <Header />
          {children}
        </ContactsProvider>
      </body>
    </html>
  );
}
