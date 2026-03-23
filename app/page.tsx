import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center flex flex-col items-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Image
            src="/logo-new.png"
            alt="Chairfill Logo"
            width={240}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
          <span className="text-4xl font-bold text-foreground tracking-tight">
            chairfill
          </span>
        </div>
        <p className="text-lg text-foreground/70 mb-8">
          Contact management and outreach
        </p>
      </div>
    </div>
  );
}
