'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PageLoader from '@/app/components/ui/PageLoader';
import { useUser } from '@/app/providers/UserProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import {
  isPublicRoute,
  ONBOARDING_BARBER_ACCOUNT,
  ONBOARDING_CHOOSE_PLAN,
} from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Where the logged-in user should be: barber-account → choose-plan → contacts.
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
 * - Redirect: barber-account → choose-plan → contacts.
 * - Uses GET /progress/me for is_technician, has_subscribed.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading } = useUser();
  const { progress, isProgressLoading } = useProgress();
  const publicRoute = isPublicRoute(pathname);
  const demo = isDemoMode();
  const desiredPath = getRedirectForProgress(progress, demo);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      if (!publicRoute) {
        const loginUrl =
          pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
      return;
    }

    if (user && isProgressLoading) return;

    if (publicRoute || pathname === '/') {
      router.replace(desiredPath);
      return;
    }

    if (desiredPath !== '/contacts' && pathname !== desiredPath) {
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
  ]);

  if (isAuthLoading) return <PageLoader />;
  if (user && isProgressLoading) return <PageLoader />;
  if (user && progress === null) return <PageLoader />;
  if (!user && !publicRoute) return <PageLoader />;

  return <>{children}</>;
}
