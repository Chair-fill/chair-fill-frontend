"use client";

import { useState } from "react";
import MarketplaceNav from "@/app/components/ui/marketplace/MarketplaceNav";
import { CITIES } from "@/lib/marketplace/data";

export default function LookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    budget: "",
    availability: "",
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /marketplace/barbers/looking { ...form }
    setSubmitted(true);
  }

  return (
    <>
      <MarketplaceNav />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-[560px] mx-auto px-5 pt-12 pb-20">
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
              For barbers
            </p>
            <h1 className="font-black text-[clamp(28px,5vw,44px)] leading-tight mb-3">
              Let shops know<br />you&apos;re looking.
            </h1>
            <p className="text-[14px] text-foreground/60 leading-relaxed">
              Add your name to the list. Shop owners in your city can see how many barbers are actively looking — and some will reach out directly.
            </p>
          </div>

          {submitted ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-[40px] mb-3">✓</p>
              <h2 className="font-black text-[22px] mb-2 text-green-500">You&apos;re on the list.</h2>
              <p className="text-[14px] text-foreground/60 max-w-[320px] mx-auto mb-6">
                Shop owners in {CITIES.find((c) => c.slug === form.city)?.name ?? "your city"} can now see you&apos;re looking. We&apos;ll text you if a match comes in.
              </p>
              <a
                href="/barber-booth-rental"
                className="inline-block px-5 py-2.5 rounded-lg border border-border text-[13px] font-semibold hover:border-primary/40 hover:text-primary transition-all"
              >
                Browse listings anyway →
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Marcus Johnson"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Phone (so shops can reach you)
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="(813) 555-0100"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  City you&apos;re looking in
                </label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Select a city…</option>
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}, {c.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Weekly budget range
                </label>
                <select
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Flexible / not sure</option>
                  <option value="under-150">Under $150/week</option>
                  <option value="150-250">$150–$250/week</option>
                  <option value="250-400">$250–$400/week</option>
                  <option value="400+">$400+/week</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/50 mb-2">
                  Anything else? (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  placeholder="Part-time only, need shampoo bowl, flexible start date…"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-[14px] hover:brightness-110 transition-all"
              >
                Add me to the list →
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
