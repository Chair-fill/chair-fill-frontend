"use client";

import { useQuery } from "@tanstack/react-query";
import { getReferralData } from "@/lib/api/referrals";
import { ReferralEntry } from "@/lib/types/referral";
import { useUser } from "@/app/providers/UserProvider";
import Link from "next/link";
import { ArrowLeft, Copy, Link2, Share2, MessageSquare } from "lucide-react";
import { useCallback, useRef, useState } from "react";

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getShareMessage(code: string) {
  return `Yo, you should check out ChairFill — it's an AI that texts your old clients and gets them back in your chair. I've been using it and it's been filling slots I was leaving empty.\n\nUse my code ${code} when you sign up and your first month is free (mine too 🤝)\n\nchairfill.co`;
}

/* ─── Sub-components ──────────────────────────────────────────── */

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl py-5 px-4 text-center">
      <div className="font-black text-[36px] leading-none text-primary mb-1">
        {value}
      </div>
      <div className="text-[11px] text-foreground/40 leading-snug">{label}</div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-card border border-border rounded-xl py-5 px-4 text-center space-y-2">
      <div className="h-9 w-12 mx-auto rounded bg-border animate-pulse" />
      <div className="h-3 w-20 mx-auto rounded bg-border animate-pulse" />
    </div>
  );
}

function StepRow({
  num,
  title,
  desc,
  last = false,
}: {
  num: string;
  title: string;
  desc: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex gap-5 ${last ? "" : "pb-7"}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-background border border-primary/40 flex items-center justify-center font-mono text-[12px] text-primary">
          {num}
        </div>
        {!last && <div className="w-px flex-1 mt-2 bg-border" />}
      </div>
      <div className="pt-1">
        <p className="font-semibold text-[14px] text-foreground mb-1">{title}</p>
        <p className="text-[13px] text-foreground/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: ReferralEntry }) {
  const isActive = entry.status === "active";
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border flex items-center justify-center font-black text-[14px] text-primary shrink-0"
          style={{
            background: "rgba(212,175,55,0.10)",
            borderColor: "rgba(212,175,55,0.3)",
          }}
        >
          {entry.referredInitial}
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {entry.referredName}
          </p>
          <p className="text-[11px] font-mono text-foreground/40">
            {formatDate(entry.createdAt)}
          </p>
        </div>
      </div>
      <span
        className={`text-[10px] font-mono tracking-wide px-2.5 py-1 rounded-full ${
          isActive
            ? "bg-green-500/10 text-green-500"
            : "bg-primary/10 text-primary"
        }`}
      >
        {isActive ? "✓ Active" : "⏳ Pending"}
      </span>
    </div>
  );
}

/* ─── Toast ───────────────────────────────────────────────────── */

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    setMsg(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2500);
  }, []);

  return { msg, show };
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function ReferralPage() {
  const { user } = useUser();
  const { msg: toastMsg, show: showToast } = useToast();
  const [codeCopied, setCodeCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["referrals", "me", user?.id],
    queryFn: getReferralData,
    enabled: !!user?.id,
  });

  const code = data?.code ?? "";

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      showToast("Code copied to clipboard");
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  function copyMessage() {
    if (!code) return;
    navigator.clipboard.writeText(getShareMessage(code)).then(() => {
      showToast("Message copied — paste it anywhere");
    });
  }

  function shareViaSMS() {
    if (!code) return;
    const body = encodeURIComponent(getShareMessage(code));
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = isIOS ? `sms:&body=${body}` : `sms:?body=${body}`;
  }

  async function nativeShare() {
    if (!navigator.share || !code) return;
    try {
      await navigator.share({
        title: "ChairFill — Free Month",
        text: getShareMessage(code),
      });
    } catch {
      // user cancelled
    }
  }

  const creditsRemaining = data?.creditsRemaining ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-[680px] mx-auto px-5 pt-12 pb-20">

        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-foreground/40 hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-9">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-3 flex items-center gap-2">
            💈 ChairFill Referral Program
            <span className="flex-1 max-w-[60px] h-px bg-primary/30" />
          </p>
          <h1 className="font-black text-[clamp(48px,10vw,72px)] leading-[0.92] tracking-tight text-foreground">
            Give a month.
            <span className="block text-primary">Get a month.</span>
          </h1>
          <p className="mt-4 text-[14px] text-foreground/50 max-w-[480px] leading-[1.7]">
            Share your code with another barber. When they sign up and run their
            first campaign, you both get a free month — credited automatically.
            No limits.
          </p>
        </div>

        {/* Credit banner — only shown when credits > 0 */}
        {creditsRemaining > 0 && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-6 py-5 mb-4 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04))",
              borderColor: "rgba(212,175,55,0.35)",
            }}
          >
            <div>
              <p className="font-semibold text-[14px] text-primary mb-0.5">
                Free months earned
              </p>
              <p className="text-[12px] text-foreground/40">
                Applied to your next billing cycle automatically
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-[40px] text-primary leading-none">
                {creditsRemaining}
              </p>
              <span className="font-mono text-[11px] text-primary/50 tracking-wider">
                MOS CREDIT
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {isLoading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard
                value={data?.totalReferred ?? 0}
                label={"Barbers\nreferred"}
              />
              <StatCard
                value={data?.activeSubscribers ?? 0}
                label={"Active\nsubscribers"}
              />
              <StatCard
                value={data?.creditsEarned ?? 0}
                label={"Months\nearned"}
              />
            </>
          )}
        </div>

        {/* Your code */}
        <div className="bg-card border border-border rounded-xl p-7 mb-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">
            Your referral code
          </p>

          {/* Code display */}
          <div
            className="relative overflow-hidden bg-background border border-border/80 rounded-lg px-6 py-5 flex items-center justify-between gap-4 mb-5"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.12), transparent 70%)",
              }}
            />
            <span
              className={`relative font-mono text-[clamp(22px,6vw,32px)] font-medium tracking-[0.12em] uppercase ${
                isLoading ? "text-primary/30 animate-pulse" : "text-primary"
              }`}
            >
              {isLoading ? "••••••••" : isError ? "Error" : code}
            </span>
            <button
              onClick={copyCode}
              disabled={isLoading || isError || !code}
              className={`relative shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-md border font-mono text-[11px] tracking-widest uppercase transition-all disabled:opacity-40 ${
                codeCopied
                  ? "border-green-500 text-green-500"
                  : "border-border text-foreground/40 hover:border-primary/50 hover:text-primary"
              }`}
            >
              <Copy className="w-3 h-3 shrink-0" />
              {codeCopied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={shareViaSMS}
              disabled={!code}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-black font-semibold text-[13px] hover:brightness-110 hover:-translate-y-px transition-all disabled:opacity-40"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              Text a barber
            </button>
            <button
              onClick={copyMessage}
              disabled={!code}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground font-semibold text-[13px] hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40"
            >
              <Link2 className="w-4 h-4 shrink-0" />
              Copy message
            </button>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={nativeShare}
                disabled={!code}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground font-semibold text-[13px] hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-card border border-border rounded-xl p-7 mb-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-6">
            How it works
          </p>
          <div>
            <StepRow
              num="01"
              title="Share your code"
              desc="Send your code to any independent barber. Text it, drop it in a group chat, whatever feels natural."
            />
            <StepRow
              num="02"
              title="They sign up and enter it"
              desc={
                <>
                  When they create their ChairFill account, they enter your code
                  at checkout.{" "}
                  <strong className="text-primary font-medium">
                    Their first month goes free.
                  </strong>
                </>
              }
            />
            <StepRow
              num="03"
              title="They run their first campaign"
              desc="After they complete onboarding and launch their first reactivation, the referral locks in."
            />
            <StepRow
              num="04"
              title="You both get a free month"
              desc={
                <>
                  One free month credited to your account automatically.{" "}
                  <strong className="text-primary font-medium">
                    No limit on how many you can refer.
                  </strong>
                </>
              }
              last
            />
          </div>
        </div>

        {/* Referral history */}
        <div className="bg-card border border-border rounded-xl p-7">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-2">
            Your referrals
          </p>

          {isLoading && (
            <div className="py-8 text-center text-[13px] text-foreground/40">
              Loading your referrals…
            </div>
          )}

          {isError && (
            <div className="py-8 text-center">
              <p className="text-[28px] mb-2">⚠️</p>
              <p className="text-[13px] text-foreground/40">
                Could not load referral data. Try refreshing.
              </p>
            </div>
          )}

          {!isLoading && !isError && (!data?.referrals || data.referrals.length === 0) && (
            <div className="py-8 text-center">
              <p className="text-[28px] mb-2 opacity-50">💈</p>
              <p className="text-[13px] text-foreground/40">
                No referrals yet. Share your code to get started.
              </p>
            </div>
          )}

          {!isLoading && !isError && data?.referrals && data.referrals.length > 0 && (
            <div>
              {data.referrals.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card border border-border rounded-full px-5 py-3 text-[13px] font-medium shadow-lg whitespace-nowrap animate-almost-done-in">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
