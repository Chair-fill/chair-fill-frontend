"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ContactRound,
  CreditCard,
  ClipboardList,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useUser } from "@/app/providers/UserProvider";
import { isPublicRoute } from "@/lib/auth";
import { formatDisplayName } from "@/lib/utils/format";
import { isDemoMode } from "@/lib/demo";
import AuthenticatedAvatar from "@/app/components/ui/AuthenticatedAvatar";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDemoBadge, setShowDemoBadge] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPublic = isPublicRoute(pathname);

  // Only show demo badge after mount to avoid hydration mismatch (isDemoMode uses localStorage)
  useEffect(() => {
    setShowDemoBadge(isDemoMode());
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 flex justify-center w-full pb-4 pointer-events-none">
      <header className="w-full max-w-6xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl px-4 sm:px-6 pointer-events-auto">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Chairfill Logo"
              width={20}
              height={20}
              className="object-contain"
              priority
            />
            <span className="text-2xl font-bold text-foreground tracking-tight hidden sm:block">
              chairfill
            </span>
            {showDemoBadge && (
              <span className="rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-medium px-2 py-0.5">
                Demo
              </span>
            )}
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <nav className="flex items-center space-x-1">
                  <Link
                    href="/contacts"
                    className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive("/contacts")
                        ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)]"
                        : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <ContactRound className="w-4 h-4" />
                    <span className="hidden sm:block pt-0.5">Contacts</span>
                  </Link>
                  <Link
                    href="/subscription"
                    className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive("/subscription")
                        ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)]"
                        : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:block pt-0.5">Subscription</span>
                  </Link>
                  <Link
                    href="/services"
                    className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive("/services")
                        ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(212,175,55,0.2)]"
                        : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:block pt-0.5">Services</span>
                  </Link>
                </nav>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                  >
                    <AuthenticatedAvatar
                      src={user.avatar}
                      alt={formatDisplayName(user.name)}
                      className="w-8 h-8 rounded-full object-cover"
                      fallback={
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      }
                    />
                    <ChevronDown
                      className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-sm font-bold text-foreground truncate">
                          {formatDisplayName(user.name)}
                        </p>
                        <p className="text-xs text-foreground/70 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              !isPublic && (
                <nav className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-foreground hover:bg-foreground/5 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </nav>
              )
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
