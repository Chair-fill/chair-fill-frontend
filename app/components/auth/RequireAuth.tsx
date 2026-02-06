'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { isPublicRoute } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';

const COMPLETE_REGISTRATION_PATH = '/complete-registration';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Protects routes: redirects unauthenticated users to /login,
 * authenticated users without work address to /complete-registration,
 * and authenticated users away from /login and /signup to app.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading } = useUser();

  const publicRoute = isPublicRoute(pathname);
  const needsAddress = user && !user.address?.trim() && !isDemoMode();
  const onCompleteRegistration = pathname === COMPLETE_REGISTRATION_PATH;

  useEffect(() => {
    if (isAuthLoading) return;

    if (publicRoute) {
      if (user) {
        if (needsAddress) router.replace(COMPLETE_REGISTRATION_PATH);
        else router.replace('/contacts');
      }
      return;
    }

    if (user && pathname === '/') {
      if (needsAddress) router.replace(COMPLETE_REGISTRATION_PATH);
      else router.replace('/contacts');
      return;
    }

    if (user && onCompleteRegistration && user.address?.trim()) {
      router.replace('/contacts');
      return;
    }

    if (user && !onCompleteRegistration && needsAddress) {
      router.replace(COMPLETE_REGISTRATION_PATH);
      return;
    }

    if (!user) {
      const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [user, isAuthLoading, pathname, router, publicRoute, needsAddress, onCompleteRegistration]);

  const loadingEl = (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );

  if (isAuthLoading) return loadingEl;

  // Don't show protected content (including root page) to logged-out users – show loading until redirect
  if (!user && !publicRoute) return loadingEl;

  return <>{children}</>;
}
