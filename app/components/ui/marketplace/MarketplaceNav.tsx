import Link from "next/link";

export default function MarketplaceNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/barber-booth-rental"
          className="font-mono text-[13px] tracking-widest text-primary hover:opacity-80 transition-opacity"
        >
          💈 CHAIRFILL BOOTHS
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/barbers/looking"
            className="text-[13px] text-foreground/60 hover:text-foreground transition-colors hidden sm:block"
          >
            I'm looking for a chair
          </Link>
          <Link
            href="/claim"
            className="text-[13px] font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-all"
          >
            Claim your shop
          </Link>
          <Link
            href="/signup?source=marketplace"
            className="text-[13px] font-semibold px-3 py-1.5 rounded-lg bg-primary text-black hover:brightness-110 transition-all"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
