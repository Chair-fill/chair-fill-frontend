import Link from "next/link";

type CTAVariant = "banner" | "post-claim" | "post-booking";

interface ChairFillCTAProps {
  variant?: CTAVariant;
  className?: string;
}

const COPY: Record<CTAVariant, { headline: string; sub: string; cta: string }> = {
  banner: {
    headline: "Keep your new chair full from day one.",
    sub: "ChairFill automatically texts your lapsed clients and fills open slots — no manual outreach.",
    cta: "See how ChairFill works →",
  },
  "post-claim": {
    headline: "You claimed your listing. Now keep it full.",
    sub: "ChairFill texts your dormant clients automatically so your chairs don't sit empty.",
    cta: "Try ChairFill free →",
  },
  "post-booking": {
    headline: "Booth booked. Don't let it sit empty.",
    sub: "ChairFill reactivates old clients automatically — your first campaign is free.",
    cta: "Start your free campaign →",
  },
};

export default function ChairFillCTA({ variant = "banner", className = "" }: ChairFillCTAProps) {
  const { headline, sub, cta } = COPY[variant];

  return (
    <div
      className={`rounded-xl border px-6 py-5 ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))",
        borderColor: "rgba(212,175,55,0.3)",
      }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary mb-1.5">
            💈 ChairFill
          </p>
          <p className="font-bold text-[15px] text-foreground mb-1">{headline}</p>
          <p className="text-[13px] text-foreground/60 leading-relaxed">{sub}</p>
        </div>
        <Link
          href="/signup?source=marketplace"
          className="shrink-0 inline-flex items-center px-4 py-2.5 rounded-lg bg-primary text-black font-semibold text-[13px] hover:brightness-110 transition-all whitespace-nowrap"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
