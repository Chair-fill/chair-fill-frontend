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
  Sparkles,
} from "lucide-react";
import PaymentModal from "@/app/features/subscription/components/PaymentModal";

export default function SubscriptionPage() {
  const { subscription, plans, subscribe, cancelSubscription, updateSubscription, toggleAutoRenew, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState<PlanDetails | null>(null);

  const currentPlan = subscription ? plans.find(p => p.id === subscription.plan) : null;
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (subscription && subscription.plan === planId) {
      return; // Already on this plan
    }

    // Free plan doesn't require payment
    if (planId === 'free') {
      handleSubscribe(planId);
      return;
    }

    // Show payment modal for paid plans
    setPlanToPurchase(plan);
    setShowPaymentModal(true);
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
      case 'free':
        return <Sparkles className="w-5 h-5" />;
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
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
                Subscription
              </h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Manage your subscription and choose a plan that fits your needs
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscription && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Current Plan
                  </h2>
                  <div className="flex items-center gap-3 mb-2">
                    {currentPlan && getPlanIcon(currentPlan.id)}
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {currentPlan?.name}
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
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Started: {formatDate(subscription.startDate)}</span>
                    </div>
                    {subscription.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Ends: {formatDate(subscription.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 ${subscription.autoRenew ? 'text-green-600 dark:text-green-400' : ''}`} />
                      <span>Auto-renew: {subscription.autoRenew ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {isActive && (
                    <>
                      <button
                        onClick={() => toggleAutoRenew()}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          `Turn Auto-renew ${subscription.autoRenew ? 'Off' : 'On'}`
                        )}
                      </button>
                      {!showCancelConfirm ? (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Confirm Cancel'
                            )}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Available Plans */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
              Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan === plan.id;
                const isSelected = selectedPlan === plan.id;
                const isPopular = plan.id === 'pro';

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-zinc-900 rounded-lg border-2 ${
                      isCurrentPlan
                        ? 'border-zinc-900 dark:border-zinc-50'
                        : isPopular
                        ? 'border-blue-500 dark:border-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800'
                    } p-6 shadow-sm transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold px-3 py-1 rounded-full">
                          CURRENT
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getPlanIcon(plan.id)}
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                          {plan.name}
                        </h3>
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                          ${plan.price}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          /{plan.pricePeriod}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (isCurrentPlan) return;
                        setSelectedPlan(plan.id);
                        handlePlanSelect(plan.id);
                      }}
                      disabled={isLoading || isCurrentPlan}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCurrentPlan
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                          : isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
                      }`}
                    >
                      {isLoading && selectedPlan === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : subscription && subscription.status === 'active' ? (
                        'Upgrade'
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Subscription Information
            </h3>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                • All plans include access to our contact management and outreach features.
              </p>
              <p>
                • You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
              <p>
                • Cancelled subscriptions remain active until the end of the current billing period.
              </p>
              <p>
                • Auto-renew can be toggled on or off at any time from your subscription settings.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {planToPurchase && (
        <PaymentModal
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
