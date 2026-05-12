import Link from "next/link";
import { CITIES } from "@/lib/marketplace/data";

export default function MarketplaceFooter() {
  return (
    <footer className="border-t border-border mt-16 py-10 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
              Top Cities
            </p>
            <ul className="space-y-1.5">
              {CITIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/barber-booth-rental/${c.slug}`}
                    className="text-[13px] text-foreground/60 hover:text-primary transition-colors"
                  >
                    {c.name}, {c.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
              More Cities
            </p>
            <ul className="space-y-1.5">
              {CITIES.slice(5).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/barber-booth-rental/${c.slug}`}
                    className="text-[13px] text-foreground/60 hover:text-primary transition-colors"
                  >
                    {c.name}, {c.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
              For Barbers
            </p>
            <ul className="space-y-1.5">
              {[
                ["Browse booths", "/barber-booth-rental"],
                ["I'm looking for a chair", "/barbers/looking"],
                ["My inquiries", "/inquiries"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-foreground/60 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-3">
              For Shop Owners
            </p>
            <ul className="space-y-1.5">
              {[
                ["Claim your shop", "/claim"],
                ["Sign up free", "/signup?source=marketplace"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-foreground/60 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="font-mono text-[13px] text-primary tracking-widest">
            💈 ChairFill
          </Link>
          <p className="text-[12px] text-foreground/30">
            © {new Date().getFullYear()} ChairFill. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, href]) => (
              <Link key={href} href={href} className="text-[12px] text-foreground/40 hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
