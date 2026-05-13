import Link from "next/link";
import Image from "next/image";

export default function MarketplaceNav() {
  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 flex justify-center w-full pb-4 pointer-events-none">
      <header className="w-full max-w-5xl bg-background/80 backdrop-blur-2xl border border-border rounded-full shadow-lg px-4 sm:px-6 pointer-events-auto">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <Image src="/logo-new.png" alt="ChairFill Logo" width={100} height={100} className="object-contain" priority />
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/barber-booth-rental" className="px-3 py-1.5 rounded-full text-[13px] font-semibold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
              Booth Rental
            </Link>
            <Link href="/claim" className="px-3 py-1.5 rounded-full text-[13px] font-semibold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
              List Your Shop
            </Link>
            <Link href="/login" className="ml-2 px-4 py-2 rounded-full text-[13px] font-bold bg-primary text-black hover:brightness-110 transition-all">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
