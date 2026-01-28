'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/app/providers/UserProvider';
import { isPublicRoute } from '@/lib/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Protects routes: redirects unauthenticated users to /login and
 * authenticated users away from /login and /signup to /contacts.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading } = useUser();

  useEffect(() => {
    if (isAuthLoading) return;

    const publicRoute = isPublicRoute(pathname);

    if (publicRoute) {
      if (user) {
        router.replace('/contacts');
      }
      return;
    }

    if (user && pathname === '/') {
      router.replace('/contacts');
      return;
    }

    if (!user) {
      const loginUrl = pathname === '/' ? '/login' : `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [user, isAuthLoading, pathname, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500 animate-spin" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
