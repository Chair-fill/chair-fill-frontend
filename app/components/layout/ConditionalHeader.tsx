'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === '/complete-registration') return null;
  return <Header />;
}
