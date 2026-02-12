'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_BARBER_ACCOUNT } from '@/lib/auth';

/**
 * Entry point after signup: redirects to barber account.
 * Onboarding flow: signup → verify email → barber-account → choose plan → checkout → contacts.
 */
export default function CompleteRegistrationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ONBOARDING_BARBER_ACCOUNT);
  }, [router]);
  return null;
}
