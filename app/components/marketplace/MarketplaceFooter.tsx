import Link from "next/link";

export default function MarketplaceFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="font-black text-[18px] text-foreground">ChairFill</p>
            <p className="text-[13px] text-foreground/50 max-w-[260px] leading-relaxed">
              AI-powered client reactivation and booth rental directory for barbers.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-[13px]">
            <div className="space-y-2">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">Marketplace</p>
              <Link href="/barber-booth-rental" className="block text-foreground/60 hover:text-primary transition-colors">Browse Booth Rentals</Link>
              <Link href="/claim" className="block text-foreground/60 hover:text-primary transition-colors">Claim Your Shop</Link>
              <Link href="/barbers/looking" className="block text-foreground/60 hover:text-primary transition-colors">I&apos;m Looking for a Chair</Link>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">ChairFill App</p>
              <Link href="/" className="block text-foreground/60 hover:text-primary transition-colors">Home</Link>
              <Link href="/login" className="block text-foreground/60 hover:text-primary transition-colors">Sign In</Link>
              <Link href="/signup" className="block text-foreground/60 hover:text-primary transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-foreground/40">&copy; {new Date().getFullYear()} ChairFill. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[12px] text-foreground/40">
            <Link href="/about" className="hover:text-foreground/70 transition-colors">About</Link>
            <span>·</span>
            <a href="mailto:support@chairfill.co" className="hover:text-foreground/70 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
