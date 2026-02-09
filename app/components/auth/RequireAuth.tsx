'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import {
  isPublicRoute,
  ONBOARDING_BARBER_ACCOUNT,
  ONBOARDING_CHOOSE_PLAN,
} from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';

const BARBER_CONFIRM_DELAY_MS = 400;

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Where the logged-in user should be, based only on progress (sequential, no "and").
 * Uses strict equality so string "false" or undefined from API is not treated as true.
 */
function getRedirectForProgress(
  progress: { is_technician?: boolean; has_subscribed?: boolean } | null,
  demo: boolean
): string {
  if (demo) return '/contacts';
  if (progress == null) return ONBOARDING_BARBER_ACCOUNT;
  if (progress.is_technician !== true) return ONBOARDING_BARBER_ACCOUNT;
  if (progress.has_subscribed !== true) return ONBOARDING_CHOOSE_PLAN;
  return '/contacts';
}

/**
 * Protects routes and enforces onboarding:
 * - Redirect destination for logged-in users: sequential check on progress (barber → choose-plan → contacts).
 * - Uses GET /progress/me for has_subscribed, is_technician.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading } = useUser();
  const { progress, isProgressLoading, refetchProgress } = useProgress();
  const didRefetchBeforeBarber = useRef(false);
  const secondRefetchScheduled = useRef(false);
  const [waitingSecondRefetch, setWaitingSecondRefetch] = useState(false);

  const publicRoute = isPublicRoute(pathname);
  const demo = isDemoMode();
  const desiredPath = getRedirectForProgress(progress, demo);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      didRefetchBeforeBarber.current = false;
      secondRefetchScheduled.current = false;
      setWaitingSecondRefetch(false);
      if (!publicRoute) {
        const loginUrl =
          pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
      return;
    }

    if (user && isProgressLoading) return;

    // Before redirecting to barber-account, refetch progress once.
    if (
      desiredPath === ONBOARDING_BARBER_ACCOUNT &&
      pathname !== ONBOARDING_BARBER_ACCOUNT &&
      !didRefetchBeforeBarber.current &&
      progress != null
    ) {
      didRefetchBeforeBarber.current = true;
      refetchProgress();
      return;
    }

    // After first refetch, if we still need barber-account: wait briefly and refetch again
    // so we don't flash barber-account when backend just set is_technician (e.g. after onboarding).
    if (
      desiredPath === ONBOARDING_BARBER_ACCOUNT &&
      pathname !== ONBOARDING_BARBER_ACCOUNT &&
      didRefetchBeforeBarber.current &&
      !secondRefetchScheduled.current &&
      progress != null
    ) {
      secondRefetchScheduled.current = true;
      setWaitingSecondRefetch(true);
      const t = setTimeout(() => {
        refetchProgress();
      }, BARBER_CONFIRM_DELAY_MS);
      return () => clearTimeout(t);
    }

    if (publicRoute || pathname === '/') {
      setWaitingSecondRefetch(false);
      router.replace(desiredPath);
      return;
    }

    if (desiredPath !== '/contacts' && pathname !== desiredPath) {
      setWaitingSecondRefetch(false);
      router.replace(desiredPath);
    }
  }, [
    user,
    isAuthLoading,
    pathname,
    router,
    publicRoute,
    desiredPath,
    isProgressLoading,
    progress,
    refetchProgress,
  ]);

  const loadingEl = (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );

  if (isAuthLoading) return loadingEl;
  if (user && isProgressLoading) return loadingEl;
  if (user && progress === null) return loadingEl; // Don't show barber-account until /progress/me has loaded
  if (user && waitingSecondRefetch) return loadingEl;
  if (!user && !publicRoute) return loadingEl;

  return <>{children}</>;
}
