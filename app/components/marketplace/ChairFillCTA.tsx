import Link from "next/link";

interface Props {
  variant?: "banner" | "post-claim";
  className?: string;
}

export default function ChairFillCTA({ variant = "banner", className = "" }: Props) {
  if (variant === "post-claim") {
    return (
      <div className={`bg-card border border-primary/20 rounded-2xl p-6 ${className}`}>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary mb-3">
          Supercharge your shop
        </p>
        <h3 className="font-black text-[20px] leading-tight mb-2">
          Never lose a client again.
        </h3>
        <p className="text-[13px] text-foreground/60 leading-relaxed mb-5">
          ChairFill automatically reactivates dormant clients via iMessage — so your chairs stay full without lifting a finger.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-black font-bold text-[13px] hover:brightness-110 transition-all"
        >
          Try ChairFill free →
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-2">
        Powered by ChairFill
      </p>
      <p className="font-bold text-[14px] mb-1.5">
        Keep your chairs full automatically.
      </p>
      <p className="text-[12px] text-foreground/60 leading-relaxed mb-4">
        AI-powered iMessage automation that reactivates dormant clients and fills your calendar.
      </p>
      <Link
        href="/signup"
        className="block text-center py-2.5 rounded-lg bg-primary text-black font-bold text-[13px] hover:brightness-110 transition-all"
      >
        Try it free →
      </Link>
    </div>
  );
}
