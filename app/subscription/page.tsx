'use client';

import { useState } from 'react';
import { useSubscription } from "@/app/providers/SubscriptionProvider";
import type { SubscriptionPlan, PlanDetails } from "@/lib/types/subscription";
import {
  Check,
  CreditCard,
  Calendar,
  RefreshCw,
  Loader2,
  Zap,
  Crown,
  Building2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { API } from "@/lib/constants/api";
import { isDemoMode } from "@/lib/demo";
import SubscriptionPaymentModal from "@/app/features/subscription/components/SubscriptionPaymentModal";

export default function SubscriptionPage() {
  const { subscription, plans, subscribe, cancelSubscription, updateSubscription, toggleAutoRenew, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState<PlanDetails | null>(null);
  const [redirectingPlanId, setRedirectingPlanId] = useState<string | null>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const currentPlan = subscription ? plans.find(p => p.id === subscription.plan) : null;
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';

  const handlePlanSelect = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (subscription && subscription.plan === planId) {
      return; // Already on this plan
    }

    if (plan.comingSoon) return;

    if (isDemoMode()) {
      setPlanToPurchase(plan);
      setShowPaymentModal(true);
      return;
    }

    // Redirect to Stripe Checkout (backend creates session, returns URL)
    setSelectedPlan(planId);
    setRedirectingPlanId(planId);
    setRedirectError(null);
    try {
      const { data } = await api.get<{ url?: string }>(
        `${API.PAYMENT.CHECKOUT_SESSION}?planId=${encodeURIComponent(planId)}`
      );
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch {
      setRedirectError('Unable to start checkout. Please try again.');
      setRedirectingPlanId(null);
      setSelectedPlan(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      if (subscription && subscription.status === 'active') {
        await updateSubscription(planId as SubscriptionPlan);
      } else {
        await subscribe(planId as SubscriptionPlan);
      }
      setSelectedPlan(null);
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handlePaymentSuccess = async () => {
    if (planToPurchase) {
      await handleSubscribe(planToPurchase.id);
      setPlanToPurchase(null);
      setShowPaymentModal(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Cancellation error:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                Manage subscription
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Upgrade your plan or manage your current subscription
            </p>
          </div>

          {/* Active subscription – always show; no subscription = prompt to select */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Active subscription
            </h2>

            {subscription ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {currentPlan && getPlanIcon(currentPlan.id)}
                      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {currentPlan?.name ?? subscription.plan}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : isCancelled
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Started: {formatDate(subscription.startDate)}
                      </span>
                      {subscription.endDate && (
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Ends: {formatDate(subscription.endDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${subscription.autoRenew ? 'text-green-600 dark:text-green-400' : ''}`} />
                        Auto-renew: {subscription.autoRenew ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-700 pt-4 sm:pt-0 sm:pl-6 flex flex-col sm:items-end gap-2">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Manage subscription</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleAutoRenew()}
                          disabled={isLoading}
                          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            `Turn auto-renew ${subscription.autoRenew ? 'off' : 'on'}`
                          )}
                        </button>
                        {!showCancelConfirm ? (
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Cancel subscription
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancel}
                              disabled={isLoading}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm cancel'}
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                              Keep subscription
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {isCancelled && subscription.endDate && (
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Your subscription remains active until {formatDate(subscription.endDate)}. You can select a new plan below before then.
                  </p>
                )}
              </>
            ) : (
              <div className="py-4">
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">You don’t have an active subscription.</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">Select a plan below to get started.</p>
              </div>
            )}
          </div>

          {/* Available Plans – compare and choose */}
          <section className="mb-8" aria-labelledby="plans-heading">
            <h2 id="plans-heading" className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Compare plans
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Choose the plan that fits your business. You'll complete payment on Stripe.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan === plan.id;
                const isPopular = plan.badge === 'Most Popular';
                const isComingSoon = plan.comingSoon ?? false;
                const isSelectable = !isCurrentPlan && !isComingSoon;

                const getCtaLabel = () => {
                  if (isCurrentPlan) return 'Your plan';
                  if (isComingSoon) return 'Contact us';
                  if (isLoading && selectedPlan === plan.id) return null;
                  const shortName = plan.name.replace(/^The\s+/, '');
                  if (subscription?.status === 'active') return `Switch to ${shortName}`;
                  return `Get ${shortName}`;
                };

                return (
                  <article
                    key={plan.id}
                    aria-current={isCurrentPlan ? 'true' : undefined}
                    className={`relative flex flex-col rounded-xl border-2 transition-all duration-200 ${
                      isCurrentPlan
                        ? 'border-zinc-400 dark:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/30 shadow-sm'
                        : isPopular
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
                        {isCurrentPlan && (
                          <span className="inline-flex items-center rounded-full bg-zinc-900 dark:bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-white dark:text-zinc-900">
                            Your plan
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
                        onClick={() => {
                          if (!isSelectable) return;
                          handlePlanSelect(plan.id);
                        }}
                        disabled={isLoading || isCurrentPlan || redirectingPlanId !== null}
                        aria-disabled={isCurrentPlan || isComingSoon}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
                          isCurrentPlan
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-default'
                            : isComingSoon
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-default'
                            : isPopular
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-50'
                        } ${(isLoading || isCurrentPlan || redirectingPlanId) ? 'cursor-not-allowed' : ''}`}
                      >
                        {redirectingPlanId === plan.id ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                            Redirecting to Stripe…
                          </span>
                        ) : isLoading && selectedPlan === plan.id ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                            Processing…
                          </span>
                        ) : (
                          getCtaLabel()
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {redirectError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{redirectError}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Manage your subscription
            </h3>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                • Upgrade or change your plan at any time. Changes take effect immediately.
              </p>
              <p>
                • Cancelled subscriptions remain active until the end of the current billing period.
              </p>
              <p>
                • Toggle auto-renew on or off above.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal - loading / success / failure */}
      {planToPurchase && (
        <SubscriptionPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPlanToPurchase(null);
            setSelectedPlan(null);
          }}
          plan={planToPurchase}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
