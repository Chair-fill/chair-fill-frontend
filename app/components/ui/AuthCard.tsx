'use client';

import { AUTH_CARD, AUTH_CARD_ROUNDED } from '@/lib/constants/ui';

interface AuthCardProps {
  children: React.ReactNode;
  /** Use rounded variant for complete-registration style */
  rounded?: boolean;
  /** Optional extra class (e.g. for animation) */
  className?: string;
}

export default function AuthCard({ children, rounded = false, className = '' }: AuthCardProps) {
  const cardClass = rounded ? AUTH_CARD_ROUNDED : AUTH_CARD;
  return <div className={`${cardClass} ${className}`.trim()}>{children}</div>;
}
