'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  CreditCard,
  Loader2,
  Zap,
  Crown,
  Building2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { getApiErrorMessage } from '@/lib/api-client';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import { useProgress } from '@/app/providers/ProgressProvider';
import type { PlanDetails } from '@/lib/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription';
import { isDemoMode } from '@/lib/demo';
import { ONBOARDING_BARBER_ACCOUNT } from '@/lib/auth';

/** Plan shape from GET plans/list?provider=stripe */
interface ApiPlan {
  id: string;
  price_id?: string;
  [key: string]: unknown;
}

/** Map API plan ids to our static plan ids */
const API_PLAN_TO_STATIC: Record<string, string> = {
  INDEPENDENT: 'independent',
  PROFESSIONAL: 'professional',
  SHOP_OWNER: 'shop-owner',
};

export default function OnboardingChoosePlanPage() {
  const router = useRouter();
  const { technician, isTechnicianLoading, refetchTechnician } = useTechnician();
  const { progress, isProgressLoading, refetchProgress } = useProgress();
  const [plans, setPlans] = useState<PlanDetails[]>(SUBSCRIPTION_PLANS);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [didRefetchTechnician, setDidRefetchTechnician] = useState(false);

  const technicianId = technician?.id ?? technician?.technician_id;

  // Page-level progress check: must be technician to be here; if already subscribed, go to contacts
  useEffect(() => {
    if (isDemoMode()) return;
    if (isProgressLoading || progress == null) return;
    if (progress.is_technician !== true) {
      router.replace(ONBOARDING_BARBER_ACCOUNT);
      return;
    }
    if (progress.has_subscribed === true) {
      router.replace('/contacts');
    }
  }, [progress, isProgressLoading, router]);

  // If backend says user is technician but we don't have technician profile yet, refetch once (handles race after barber onboarding or different response shape)
  useEffect(() => {
    if (isDemoMode() || didRefetchTechnician) return;
    if (progress?.is_technician !== true || technicianId) return;
    if (!isTechnicianLoading) {
      setDidRefetchTechnician(true);
      refetchTechnician();
    }
  }, [progress?.is_technician, technicianId, isTechnicianLoading, didRefetchTechnician, refetchTechnician]);

  useEffect(() => {
    if (isDemoMode()) {
      setPlans(SUBSCRIPTION_PLANS);
      setIsLoadingPlans(false);
      return;
    }
    let cancelled = false;
    async function fetchPlans() {
      setIsLoadingPlans(true);
      try {
        const { data } = await api.get<ApiPlan[] | { data?: ApiPlan[] }>(
          `${API.PLANS.LIST}?provider=stripe`
        );
        const raw = Array.isArray(data) ? data : (data as { data?: ApiPlan[] })?.data;
        const apiPlans: ApiPlan[] = Array.isArray(raw) ? raw : [];
        if (cancelled) return;
        const merged: PlanDetails[] = SUBSCRIPTION_PLANS.map((p) => {
          const apiPlan = apiPlans.find((a) => {
            const apiId = String(a.id).toUpperCase();
            const staticId = API_PLAN_TO_STATIC[apiId] ?? p.id;
            return staticId === p.id;
          });
          return {
            ...p,
            price_id: apiPlan?.price_id ?? p.price_id,
          };
        });
        setPlans(merged);
      } catch {
        if (!cancelled) setPlans(SUBSCRIPTION_PLANS);
      } finally {
        if (!cancelled) setIsLoadingPlans(false);
      }
    }
    fetchPlans();
    return () => { cancelled = true; };
  }, []);

  const handlePlanClick = async (plan: PlanDetails) => {
    if (plan.comingSoon) return;
    if (!plan.price_id) {
      setError('This plan is not available for subscription yet.');
      return;
    }
    if (!technicianId) {
      setError('Technician profile not found. Please complete onboarding first.');
      return;
    }
    setError('');
    setSubscribingPlanId(plan.id);
    try {
      if (isDemoMode()) {
        await new Promise((r) => setTimeout(r, 800));
        await refetchProgress();
        router.push('/contacts');
        return;
      }
      const { data } = await api.post<{
        url?: string;
        data?: { url?: string; checkoutSession?: { url?: string } };
      }>(API.SUBSCRIPTION.SUBSCRIBE, {
        price_id: plan.price_id,
        technician_id: technicianId,
      });
      const raw = data && typeof data === 'object' ? data : null;
      const checkoutUrl =
        (raw && typeof (raw as { url?: string }).url === 'string' ? (raw as { url: string }).url : null) ??
        (raw && (raw as { data?: { url?: string } }).data?.url) ??
        (raw && (raw as { data?: { checkoutSession?: { url?: string } } }).data?.checkoutSession?.url);
      if (checkoutUrl && typeof checkoutUrl === 'string') {
        window.location.href = checkoutUrl;
        return;
      }
      setError('No checkout URL returned. Please try again or contact support.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'independent':
        return <Zap className="w-5 h-5" />;
      case 'professional':
        return <Crown className="w-5 h-5" />;
      case 'shop-owner':
        return <Building2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  // Wait for progress before showing content (avoids flash before redirect)
  if (!isDemoMode() && isProgressLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-500 dark:text-zinc-400" aria-hidden />
      </div>
    );
  }

  // Wait for technician profile when backend says user is technician (e.g. after barber onboarding or refetch)
  if (!isDemoMode() && progress?.is_technician === true && !technicianId && isTechnicianLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-500 dark:text-zinc-400" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header – same style as subscription page */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Choose your plan
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Select a plan that fits your business. You’ll complete payment on the next step.
            </p>
          </div>

          {!isDemoMode() && progress?.is_technician === true && !technicianId && !isTechnicianLoading && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Technician profile not found. Please complete onboarding first, or try again.
              </p>
              <button
                type="button"
                onClick={() => { setError(''); refetchTechnician(); }}
                className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Compare plans – same section/card design as subscription page */}
          <section className="mb-8" aria-labelledby="plans-heading">
            <h2 id="plans-heading" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Compare plans
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Choose the plan that fits your business. You can change or cancel anytime.
            </p>

            {isLoadingPlans ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-zinc-500 dark:text-zinc-400" aria-hidden />
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const isPopular = plan.badge === 'Most Popular';
                const isComingSoon = plan.comingSoon ?? false;
                const isSelectable = !isComingSoon && !!plan.price_id;
                const isSubscribing = subscribingPlanId === plan.id;

                return (
                  <article
                    key={plan.id}
                    role={isSelectable ? 'button' : undefined}
                    tabIndex={isSelectable ? 0 : undefined}
                    onClick={() => !isComingSoon && handlePlanClick(plan)}
                    onKeyDown={(e) => {
                      if (isComingSoon) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePlanClick(plan);
                      }
                    }}
                    className={`relative flex flex-col rounded-xl border-2 transition-all duration-200 ${
                      isPopular
                        ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-zinc-900 shadow-lg shadow-blue-500/10 lg:shadow-xl lg:shadow-blue-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm'
                    } ${isSelectable ? 'hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer' : ''}`}
                  >
                    {/* Badges */}
                    <div className="flex items-start justify-between gap-2 p-5 pb-0">
                      <div className="flex flex-wrap gap-2">
                        {plan.badge === 'Most Popular' && (
                          <span className="inline-flex items-center rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-medium text-white">
                            Recommended
                          </span>
                        )}
                        {plan.badge === 'Coming Soon' && (
                          <span className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            Coming soon
                          </span>
                        )}
                      </div>
                      {getPlanIcon(plan.id)}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                        {plan.name}
                      </h3>
                      {plan.tagline && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                          {plan.tagline}
                        </p>
                      )}

                      <div className="mb-4">
                        {plan.price != null ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                              ${plan.price}
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400">
                              /{plan.pricePeriod}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                              Custom
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                              — {plan.pricePeriodLabel ?? 'Contact us'}
                            </span>
                          </div>
                        )}
                        {plan.subtitle && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {plan.subtitle}
                          </p>
                        )}
                      </div>

                      <ul className="space-y-2.5 flex-1 mb-6" role="list">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-sm">
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" aria-hidden />
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isComingSoon) handlePlanClick(plan);
                        }}
                        disabled={isComingSoon || isSubscribing}
                        aria-disabled={isComingSoon || isSubscribing}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 inline-flex items-center justify-center gap-2 ${
                          isComingSoon
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-default'
                            : isPopular
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-50'
                        }`}
                      >
                        {isComingSoon ? 'Contact us' : isSubscribing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subscribing…
                          </>
                        ) : (
                          'Subscribe'
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            )}
          </section>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
