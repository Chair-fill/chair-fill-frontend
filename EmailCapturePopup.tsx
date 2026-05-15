"use client";

import { useState, useEffect } from "react";
import { X, Scissors, Loader2, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "chairfill_popup_dismissed";
const DELAY_MS = 8000;

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "1");
      setTimeout(dismiss, 2800);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        onClick={dismiss}
      />

      <div
        className={`fixed z-50 inset-x-4 bottom-6 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-md transition-all duration-300 ${
          closing ? "opacity-0 translate-y-4 scale-[0.97]" : "opacity-100 translate-y-0 scale-100"
        }`}
        style={{ animation: closing ? "none" : "popup-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#d4af37]/40 via-[#d4af37] to-[#d4af37]/40" />

          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-7 pt-7 pb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20">
                <Scissors className="w-5 h-5 text-[#d4af37]" />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#d4af37]/80">
                Limited Offer
              </span>
            </div>

            <h2 className="text-[22px] font-black text-white leading-snug mb-2">
              Get <span className="text-[#d4af37]">30 Days Free</span> on ChairFill Pro
            </h2>
            <p className="text-sm text-white/55 leading-relaxed mb-6">
              Join barbers using AI to reactivate dormant clients and fill empty chairs — automatically. No cold calls. No awkward texts.
            </p>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="w-10 h-10 text-[#d4af37]" />
                <p className="text-sm font-bold text-white">You&apos;re in! Check your inbox.</p>
                <p className="text-xs text-white/50 text-center">We&apos;ll send your free trial details shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-all disabled:opacity-50"
                />
                {status === "error" && (
                  <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#d4af37] text-black text-sm font-black tracking-tight hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-[#d4af37]/20"
                >
                  {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {status === "loading" ? "Claiming..." : "Claim My Free Month"}
                </button>
                <p className="text-center text-[11px] text-white/30">
                  No credit card required · Cancel anytime
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
