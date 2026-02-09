'use client';

import { AUTH_LAYOUT, AUTH_LAYOUT_INNER } from '@/lib/constants/ui';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Optional extra class on the outer div (e.g. complete-registration-page) */
  className?: string;
}

export default function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  return (
    <div className={`${AUTH_LAYOUT} ${className}`.trim()}>
      <div className={AUTH_LAYOUT_INNER}>{children}</div>
    </div>
  );
}
