'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import { isOnboardingRoute, isPublicRoute } from '@/lib/auth';

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === '/complete-registration' || isOnboardingRoute(pathname) || isPublicRoute(pathname)) return null;
  return <Header />;
}
