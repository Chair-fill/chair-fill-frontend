'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import { isOnboardingRoute, isPublicRoute } from '@/lib/auth';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  if (pathname === '/complete-registration' || isOnboardingRoute(pathname) || isPublicRoute(pathname)) return null;
  return <BottomNav />;
}
