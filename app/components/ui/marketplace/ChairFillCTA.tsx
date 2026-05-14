import React from "react";
import Link from "next/link";

interface ChairFillCTAProps {
  variant?: "banner" | "post-claim" | "default";
  className?: string;
}

export default function ChairFillCTA({ variant = "default", className = "" }: ChairFillCTAProps) {
  if (variant === "post-claim") {
    return (
      <div className={`bg-primary/5 border border-primary/20 rounded-2xl p-6 ${className}`}>
        <h3 className="font-black text-[18px] mb-2">Power up your shop with ChairFill</h3>
        <p className="text-[14px] text-foreground/70 mb-4 leading-relaxed">
          Manage your bookings, availability, and payments all in one place.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-[13px] hover:brightness-110 transition-all"
        >
          Get started for free →
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-card border border-border rounded-2xl p-8 ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-3">Shop Owners</p>
        <h3 className="font-black text-[24px] leading-tight mb-3">
          Stop chasing booth rent.<br />
          <span className="text-primary">Start scaling your shop.</span>
        </h3>
        <p className="text-[14px] text-foreground/60 max-w-[380px] mb-6 leading-relaxed">
          ChairFill helps shop owners fill empty chairs, manage barber rentals, and track revenue automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/claim"
            className="px-6 py-3 rounded-xl bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all shadow-lg shadow-primary/10"
          >
            Claim your shop free
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 rounded-xl border border-border text-[14px] font-semibold hover:border-primary/40 hover:text-primary transition-all"
          >
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
