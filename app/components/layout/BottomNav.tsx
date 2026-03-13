"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ContactRound,
  CreditCard,
  Calendar,
  ClipboardList,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      label: "Contacts",
      href: "/contacts",
      icon: ContactRound,
    },
    {
      label: "Subscription",
      href: "/subscription",
      icon: CreditCard,
    },
    {
      label: "Bookings",
      href: "/bookings",
      icon: Calendar,
    },
    {
      label: "Services",
      href: "/services",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <nav className="w-full max-w-md mx-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-x border-white/10 rounded-t-2xl shadow-2xl flex items-center justify-around p-1 pb-4 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 flex-1 ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "scale-110" : ""}`} />
              <span className="text-[10px] font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
