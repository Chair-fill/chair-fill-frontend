"use client";

import { useState } from "react";
import Link from "next/link";
import { SHOPS } from "@/lib/marketplace/data";
import MarketplaceNav from "@/app/components/ui/marketplace/MarketplaceNav";
import ChairFillCTA from "@/app/components/ui/marketplace/ChairFillCTA";

type Step = "find" | "verify" | "profile" | "done";

export default function ClaimPage() {
  const [step, setStep] = useState<Step>("find");
  const [search, setSearch] = useState("");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState({ name: "", bio: "", instagram: "" });
  const [showCFModal, setShowCFModal] = useState(false);

  const filtered = SHOPS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  );

  function handleFind(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedShop) return;
    // TODO: POST /marketplace/claims/start { shopSlug: selectedShop }
    setStep("verify");
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /marketplace/claims/verify-sms { shopSlug: selectedShop, phone, code }
    setStep("profile");
  }

  function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /marketplace/claims/complete { shopSlug: selectedShop, ...profile }
    setStep("done");
    setShowCFModal(true);
  }

  const stepNum = { find: 1, verify: 2, profile: 3, done: 4 }[step];

  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-[560px] mx-auto px-5 pt-12 pb-20">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
              Claim your shop
            </p>
            <h1 className="font-black text-[clamp(28px,5vw,44px)] leading-tight">
              Get found by barbers<br />looking for a chair.
            </h1>
          </div>

          {/* Step indicator */}
          {step !== "done" && (
            <div className="flex items-center gap-2 mb-8">
              {(["find", "verify", "profile"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono border ${
                      stepNum > i + 1
                        ? "bg-primary border-primary text-black"
                        : stepNum === i + 1
                          ? "border-primary text-primary"
                          : "border-border text-foreground/30"
                    }`}
                  >
                    {stepNum > i + 1 ? "✓" : i + 1}
                  </div>
                  {i < 2 && <div className={`h-px w-8 ${stepNum > i + 1 ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Find */}
          {step === "find" && (
            <form onSubmit={handleFind} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Search for your shop
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedShop(null); }}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Shop name or address…"
                />
              </div>

              {search.length > 1 && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {filtered.length === 0 ? (
                    <p className="px-4 py-3 text-[13px] text-foreground/50">No shops found. We&apos;ll add yours manually.</p>
                  ) : (
                    filtered.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => setSelectedShop(s.slug)}
                        className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors ${
                          selectedShop === s.slug ? "bg-primary/10 text-primary" : "hover:bg-card"
                        }`}
                      >
                        <p className="font-semibold text-[14px]">{s.name}</p>
                        <p className="text-[12px] text-foreground/50">{s.address}</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedShop}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-40"
              >
                Continue →
              </button>
            </form>
          )}

          {/* Step 2 — Verify */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-[14px] text-foreground/70 leading-relaxed">
                We&apos;ll send a verification code to the phone number listed for your shop.
              </p>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Shop phone number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="(813) 555-0101"
                />
              </div>
              <button
                type="button"
                className="w-full py-3 rounded-xl border border-border font-semibold text-[14px] hover:border-primary/40 hover:text-primary transition-all"
                onClick={() => {/* TODO: POST /marketplace/claims/send-sms */}}
              >
                Send verification code
              </button>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  6-digit code
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] font-mono tracking-[0.3em] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={code.length < 6}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all disabled:opacity-40"
              >
                Verify & continue →
              </button>
            </form>
          )}

          {/* Step 3 — Profile */}
          {step === "profile" && (
            <form onSubmit={handleProfile} className="space-y-5">
              <p className="text-[14px] text-foreground/70">
                Add some details to make your listing stand out to barbers.
              </p>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Your name (owner)
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Marcus Johnson"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Short shop description
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  placeholder="Tell barbers what makes your shop great…"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Instagram handle (optional)
                </label>
                <input
                  type="text"
                  value={profile.instagram}
                  onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="@yourshop"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all"
              >
                Claim my listing →
              </button>
            </form>
          )}

          {/* Step 4 — Done */}
          {step === "done" && (
            <div className="text-center space-y-6">
              <div>
                <p className="text-[48px] mb-3">🎉</p>
                <h2 className="font-black text-[28px] mb-2">You&apos;re listed!</h2>
                <p className="text-[14px] text-foreground/60 max-w-[360px] mx-auto">
                  Barbers in your city can now find and inquire about your booth. You&apos;ll receive a notification when someone reaches out.
                </p>
              </div>
              <Link
                href="/inquiries"
                className="inline-block px-6 py-3 rounded-xl border border-border font-semibold text-[14px] hover:border-primary/40 hover:text-primary transition-all"
              >
                View my inquiries →
              </Link>

              {/* ChairFill post-claim CTA */}
              {showCFModal && (
                <ChairFillCTA variant="post-claim" className="text-left" />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
