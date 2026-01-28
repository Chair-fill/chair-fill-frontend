'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContactRound, CreditCard, User, Settings, LogOut, ChevronDown, LogIn, UserPlus } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { isPublicRoute } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPublic = isPublicRoute(pathname);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              chairfill
            </span>
            {typeof window !== 'undefined' && isDemoMode() && (
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/contacts')
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ContactRound className="w-4 h-4" />
                    <span className="hidden sm:block pt-0.5">Contacts</span>
                  </Link>
                  <Link
                    href="/subscription"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/subscription')
                        ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:block pt-0.5">Subscription</span>
                  </Link>
                </nav>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white dark:text-zinc-900">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </nav>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
