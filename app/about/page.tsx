import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About ChairFill — Built for Barbers by Someone Who Gets It",
  description:
    "ChairFill was built because the money was already there — barbers just needed the right tool to get it back. The story behind the platform.",
  alternates: { canonical: "https://chairfill.co/about" },
  openGraph: {
    title: "About ChairFill",
    description: "Built for barbers by someone who gets it. The story behind ChairFill.",
    type: "website",
  },
};

/* ─── Sub-components ──────────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary mb-4">
      {children}
    </p>
  );
}

function Display({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-sans text-[clamp(42px,8vw,72px)] leading-[0.92] tracking-[0.01em] mb-6 font-black ${className}`}
    >
      {children}
    </h2>
  );
}

function Gold({ children }: { children: React.ReactNode }) {
  return <em className="text-primary not-italic">{children}</em>;
}

function PullQuote({ quote, attr }: { quote: string; attr: string }) {
  return (
    <blockquote className="relative overflow-hidden bg-card border border-border border-l-[3px] border-l-primary rounded-r-xl px-8 py-7 my-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 0% 50%, rgba(212,175,55,0.10), transparent 60%)",
        }}
      />
      <p className="relative font-sans text-[clamp(20px,3.5vw,30px)] leading-[1.2] text-foreground font-black mb-3">
        {quote}
      </p>
      <p className="relative font-mono text-[10px] tracking-[0.16em] uppercase text-foreground/40">
        {attr}
      </p>
    </blockquote>
  );
}

function SectionDivider() {
  return <div className="h-px bg-border" />;
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 pb-20">
          <div
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(212,175,55,0.07), transparent 70%)",
            }}
          />
          <div className="relative container mx-auto px-6 max-w-[780px]">
            <Eyebrow>About ChairFill</Eyebrow>
            <h1 className="font-sans text-[clamp(42px,8vw,72px)] leading-[0.92] tracking-[0.01em] mb-6 font-black">
              Built for barbers
              <Gold>
                <span className="block italic"> by someone who gets it.</span>
              </Gold>
            </h1>
            <p className="text-[18px] text-foreground/60 leading-[1.75] max-w-[580px] mt-2">
              ChairFill started with a simple observation: independent barbers are some of the
              hardest-working business owners in America — and they&apos;re leaving thousands of
              dollars in revenue untouched every single month. Not because they don&apos;t work hard
              enough. Because no one built the right tool.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* ── THE OBSERVATION ─────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-[780px]">
            <Eyebrow>The Observation</Eyebrow>
            <Display>
              The money was already there.
              <br />
              <Gold>Nobody was getting it.</Gold>
            </Display>

            <div className="text-[16px] text-foreground/70 leading-[1.8] space-y-5">
              <p>
                The average barber has 40 to 60 clients who haven&apos;t shown up in the last 90
                days. That&apos;s thousands of dollars sitting dormant in their phone — not gone,
                just quiet.
              </p>
              <p>
                I watched barbers with real skill, established chairs, and loyal clients slowly lose
                revenue to something invisible: clients who used to come every three weeks started
                coming every six, then stopped altogether. No argument. No complaint. They just went
                quiet.
              </p>
            </div>

            <PullQuote
              quote="&ldquo;I know I should reach out — I just don&rsquo;t have time.&rdquo;"
              attr="— Every barber I talked to. Every single one."
            />

            <p className="text-[16px] text-foreground/70 leading-[1.8]">
              They&apos;re behind the chair all day. They can&apos;t stop every hour to craft a
              personal message to five clients who&apos;ve been waiting too long. The problem
              wasn&apos;t motivation. It was capacity. And the tools they had weren&apos;t solving it.
            </p>

            {/* Stat row */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden mt-12 mb-0">
              {[
                { num: "40–60", label: "Dormant clients the average barber has right now" },
                { num: "90", label: "Days since their last visit — still fully recoverable" },
                { num: "$0", label: "What existing tools do to bring them back" },
              ].map(({ num, label }) => (
                <div key={num} className="bg-card py-8 px-6 text-center">
                  <div className="font-sans text-[clamp(36px,5vw,56px)] text-primary leading-none mb-1.5 font-black">
                    {num}
                  </div>
                  <div className="text-[13px] text-foreground/50 leading-snug">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── THE PROBLEM ─────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-[780px]">
            <Eyebrow>The Problem</Eyebrow>
            <Display>
              Existing tools don&apos;t
              <br />
              <Gold>solve this.</Gold>
            </Display>

            <div className="text-[16px] text-foreground/70 leading-[1.8] space-y-5 mb-10">
              <p>I want to be direct — because it&apos;s the whole reason ChairFill exists.</p>
              <p>
                Booksy waits for clients to come back on their own. Square sends generic emails that
                nobody opens. They both send automated messages through channels nobody acknowledges
                — except when they&apos;re already on their way to the chair. They don&apos;t solve
                the reactivation problem. They don&apos;t even try.
              </p>
            </div>

            {/* Tool compare */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Them */}
              <div className="bg-card border border-border rounded-xl p-7">
                <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
                  What they do
                </p>
                <p className="font-sans text-[26px] font-black leading-none mb-5">
                  Booksy &amp; Square
                </p>
                {[
                  "Wait for clients to come back on their own",
                  "Generic emails nobody reads",
                  "Marketing tools that aren't automated",
                  "Not customized to the individual client",
                  "Wrong channel — not where clients actually respond",
                ].map((pt) => (
                  <div
                    key={pt}
                    className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0 text-[13px] text-foreground/50 leading-snug"
                  >
                    <span className="text-foreground/30 mt-0.5 text-xs shrink-0">✗</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Us */}
              <div
                className="bg-card border border-border rounded-xl p-7"
                style={{
                  borderColor: "rgba(212,175,55,0.35)",
                  background: "rgba(212,175,55,0.04)",
                }}
              >
                <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-primary mb-3">
                  What ChairFill does
                </p>
                <p className="font-sans text-[26px] font-black leading-none text-primary mb-5">
                  ChairFill
                </p>
                {[
                  "Goes and gets lapsed clients — automatically",
                  "iMessage — 98% open rate, real replies",
                  "Fully automated, zero manual work",
                  "Calibrated to each client, sounds like you",
                  "The same place clients text their people",
                ].map((pt) => (
                  <div
                    key={pt}
                    className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0 text-[13px] text-foreground/70 leading-snug"
                  >
                    <span className="text-green-400 mt-0.5 text-xs shrink-0">✓</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <PullQuote
              quote="There wasn't a tool that did what a good barber would do if they had unlimited time."
              attr="Personally reach out to every lapsed client — in a tone that feels real, through a channel that actually gets read."
            />

            <p className="text-[16px] text-foreground/70 leading-[1.8]">
              <strong className="text-foreground font-semibold">That&apos;s what ChairFill does.</strong>{" "}
              We built the thing that should have already existed.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* ── FOUNDER ─────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-[780px]">
            <Eyebrow>The Founder</Eyebrow>

            <div className="bg-card border border-border rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[260px_1fr]">
              {/* Left panel */}
              <div className="relative bg-card flex flex-col sm:items-center sm:justify-center items-start flex-row sm:flex-col gap-4 p-7 sm:p-12 overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.16), transparent 65%)",
                  }}
                />
                <div className="relative w-[88px] h-[88px] rounded-full border-2 flex items-center justify-center font-sans text-[34px] font-black text-primary shrink-0"
                  style={{
                    background: "rgba(212,175,55,0.10)",
                    borderColor: "rgba(212,175,55,0.4)",
                  }}
                >
                  M
                </div>
                <div className="relative">
                  <p className="font-sans text-[30px] font-black leading-none sm:text-center">
                    McArthur
                  </p>
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-primary sm:text-center mt-1">
                    Founder &amp; CEO, ChairFill
                  </p>
                  <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-foreground/50 bg-border border border-border rounded-full px-3 py-1 mt-3 inline-block">
                    Tampa, Florida
                  </p>
                </div>
              </div>

              {/* Right panel */}
              <div className="p-7 sm:p-10 flex flex-col justify-center">
                <div className="text-[15px] text-foreground/70 leading-[1.8] space-y-4">
                  <p>
                    I didn&apos;t build ChairFill because I saw a market opportunity. I built it
                    because I kept watching the same thing happen — barbers with real talent and real
                    client loyalty slowly bleeding revenue to a problem that had a fixable answer.
                    Nobody was fixing it.
                  </p>
                  <p>
                    The barbers I talked to weren&apos;t struggling because of skill. They were
                    struggling because the tools available to them treated their business like a
                    dental office — automated confirmations, generic follow-ups, emails that went
                    unread. None of it fit how barbers actually communicate with clients.
                  </p>
                  <p>
                    <strong className="text-foreground font-semibold">
                      Barbers text. Their clients text back.
                    </strong>{" "}
                    That&apos;s the channel. ChairFill is built around that reality, not around what
                    was easy to build.
                  </p>
                </div>
              </div>
            </div>

            {/* Veteran strip */}
            <div className="flex items-center gap-5 bg-card border border-border rounded-xl px-6 py-5 mt-5">
              <span className="text-[26px] shrink-0">🇺🇸</span>
              <div>
                <p className="font-semibold text-[14px] mb-0.5">Veteran-Owned Business</p>
                <p className="text-[13px] text-foreground/50 leading-snug">
                  ChairFill is a veteran-owned company, founded in Tampa, Florida. Built for barbers
                  who put in the work.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── WHAT WE'RE BUILDING ─────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-[780px]">
            <Eyebrow>What We&apos;re Building</Eyebrow>
            <Display>
              Revenue recovery
              <br />
              <Gold>on autopilot.</Gold>
            </Display>

            <p className="text-[16px] text-foreground/70 leading-[1.8] mb-9">
              ChairFill isn&apos;t a scheduling app with a marketing add-on. It&apos;s a complete
              revenue recovery system — built first for independent barbers who own their booth and
              control their income.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: "🔁",
                  title: "Reactivation Engine™",
                  desc: "Identifies every dormant client and reaches out automatically — in your voice, at the pace of a real conversation.",
                },
                {
                  icon: "💬",
                  title: "Personal Channel Delivery™",
                  desc: "iMessage — 98% open rate. The same place your clients text their people. Not a marketing app.",
                },
                {
                  icon: "🛡️",
                  title: "No-Show Shield™",
                  desc: "Layered reminders that drop no-show rates to near zero. The appointments you book actually show up.",
                },
                {
                  icon: "⚡",
                  title: "Gap Filler™",
                  desc: "When a slot opens, ChairFill reaches the clients most likely to fill it — before you've finished reading the cancellation.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="text-[20px] mb-2.5">{icon}</div>
                  <p className="font-semibold text-[15px] mb-1.5">{title}</p>
                  <p className="text-[13px] text-foreground/50 leading-[1.6]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── STRAIGHT TALK ───────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-[780px]">
            <Eyebrow>No Spin</Eyebrow>
            <Display>
              What ChairFill is.
              <br />
              <Gold>What it isn&apos;t.</Gold>
            </Display>

            <div className="bg-card border border-border rounded-2xl overflow-hidden mt-10">
              {/* Header */}
              <div className="flex items-center gap-2.5 px-7 py-5 border-b border-border">
                <div className="w-[7px] h-[7px] rounded-full bg-primary" />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
                  Straight talk
                </span>
              </div>

              {[
                {
                  not: "Another booking app that waits for clients to come back on their own.",
                  is: "A revenue recovery system that goes out and gets them back — automatically, in your voice.",
                },
                {
                  not: "A replacement for Booksy or Square. Those tools manage the clients you already have.",
                  is: "The layer that goes after the clients those tools gave up on. Works alongside whatever you use.",
                },
                {
                  not: "A generic AI chatbot sending bulk texts.",
                  is: "Personal iMessage outreach calibrated to sound like you. Clients feel like their barber remembered them — not like they got a blast.",
                },
                {
                  not: "Locked to independent barbers forever. The platform is built to grow.",
                  is: "Starting where it matters most: the independent operator. Built to eventually serve shop owners and multi-chair operations too.",
                },
              ].map(({ not, is }, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-2 border-b border-border last:border-0"
                >
                  <div className="px-7 py-5 text-[14px] leading-[1.65] text-foreground/50 sm:border-r border-border">
                    <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-foreground/30 mb-1.5">
                      What it&apos;s not
                    </p>
                    {not}
                  </div>
                  <div className="px-7 py-5 text-[14px] leading-[1.65] text-foreground/70">
                    <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-green-500 mb-1.5">
                      What it is
                    </p>
                    {is}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 pb-20 text-center">
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(212,175,55,0.06), transparent 70%)",
            }}
          />
          <div className="relative container mx-auto px-6 max-w-[780px]">
            <h2 className="font-sans text-[clamp(44px,8vw,72px)] leading-[0.92] tracking-[0.01em] mb-6 font-black">
              Stop leaving money
              <br />
              <Gold>in your phone.</Gold>
            </h2>
            <p className="text-[16px] text-foreground/50 max-w-[460px] mx-auto mb-9 leading-[1.7]">
              5 barbers get their first month completely free. No card. We set everything up. If
              ChairFill brings back even one client — you stay at $147/mo locked in for life.
            </p>
            <Link
              href="/waitlist"
              className="inline-block bg-primary text-black font-bold text-[15px] px-8 py-4 rounded-lg hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg"
              style={{ boxShadow: "0 8px 28px rgba(212,175,55,0.25)" }}
            >
              Claim a Free Spot →
            </Link>
            <p className="font-mono text-[11px] text-foreground/30 mt-3.5 tracking-[0.06em]">
              No card required · 5 spots · First come, first served
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
