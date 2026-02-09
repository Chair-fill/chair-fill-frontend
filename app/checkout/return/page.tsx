'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '@/app/providers/SubscriptionProvider';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { SubscriptionPlan } from '@/lib/types/subscription';

const VALID_PLANS: SubscriptionPlan[] = ['independent', 'professional', 'shop-owner'];

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { subscribe } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'complete' | 'open' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID provided.');
      return;
    }

    let cancelled = false;

    async function checkSession() {
      try {
        const { data } = await api.get<{ status?: string; planId?: string }>(
          `${API.PAYMENT.SESSION_STATUS}?session_id=${encodeURIComponent(sessionId!)}`
        );
        if (cancelled) return;
        if (data?.status === 'complete') {
          setStatus('complete');
          const planId = data.planId;
          if (planId && VALID_PLANS.includes(planId as SubscriptionPlan)) {
            try {
              await subscribe(planId as SubscriptionPlan);
              setTimeout(() => router.replace('/contacts'), 2000);
              return;
            } catch {
              // Subscription updated via webhook; redirect anyway
            }
          }
          setTimeout(() => router.replace('/subscription'), 2000);
          return;
        }
        if (data?.status === 'open') {
          setStatus('open');
          return;
        }
        setStatus('error');
        setError('Unable to verify payment status.');
      } catch {
        if (cancelled) return;
        setStatus('error');
        setError('Unable to verify payment. Please check your subscription page.');
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, [sessionId, router, subscribe]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-zinc-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Payment successful!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Your subscription is now active. Redirecting you to the app...
          </p>
          <button
            type="button"
            onClick={() => router.replace('/contacts')}
            className="px-6 py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
          >
            Go to app
          </button>
        </div>
      </div>
    );
  }

  if (status === 'open') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 dark:text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Payment not completed
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The payment was cancelled or could not be completed. You can try again from the subscription page.
          </p>
          <button
            type="button"
            onClick={() => router.replace('/subscription')}
            className="px-6 py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
          >
            Back to subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Something went wrong
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error ?? 'Unable to verify payment.'}</p>
        <button
          type="button"
          onClick={() => router.replace('/subscription')}
          className="px-6 py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
        >
          Back to subscription
        </button>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}
