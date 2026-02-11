'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Subscription, SubscriptionPlan, PlanDetails } from '@/lib/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription';
import { storage } from '@/lib/utils/storage';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import { isDemoMode } from '@/lib/demo';
import { useTechnician } from '@/app/providers/TechnicianProvider';

/** Map backend subscription response to our Subscription type. Uses same logic as lib/api/subscription. */
function mapApiSubscriptionToSubscription(raw: Record<string, unknown> | null): Subscription | null {
  if (!raw || typeof raw !== 'object') return null;
  const planRaw = raw.plan ?? raw.plan_id;
  let plan: SubscriptionPlan | null = null;
  if (typeof planRaw === 'string') {
    const lower = planRaw.toLowerCase();
    plan = ['independent', 'professional', 'shop-owner'].includes(lower) ? (lower as SubscriptionPlan) : null;
  } else if (planRaw && typeof planRaw === 'object' && 'name' in planRaw && typeof (planRaw as { name: string }).name === 'string') {
    const name = ((planRaw as { name: string }).name || '').toLowerCase();
    plan = ['independent', 'professional', 'shop-owner'].includes(name) ? (name as SubscriptionPlan) : null;
  }
  if (!plan) return null;
  const statusRaw = String((raw.subscription_status ?? raw.status) ?? '').toLowerCase();
  const status: Subscription['status'] =
    statusRaw === 'cancelled' || statusRaw === 'canceled' ? 'cancelled'
    : statusRaw === 'expired' ? 'expired'
    : statusRaw === 'trialing' || statusRaw === 'trial' ? 'trial'
    : 'active';
  const startDate = (raw.startDate as string) ?? (raw.start_date as string) ?? new Date().toISOString();
  const endDate = (raw.endDate as string) ?? (raw.end_date as string) ?? (raw.expiry as string) ?? undefined;
  const autoRenew = raw.autoRenew !== undefined ? !!raw.autoRenew : (raw.auto_renew as boolean) !== false;
  return {
    plan,
    status,
    startDate,
    endDate: endDate || undefined,
    autoRenew,
  };
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: PlanDetails[];
  subscribe: (planId: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateSubscription: (planId: SubscriptionPlan) => Promise<void>;
  toggleAutoRenew: () => Promise<void>;
  refetchSubscription: () => Promise<void>;
  isLoading: boolean;
  subscriptionError: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { technician } = useTechnician();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const VALID_PLANS: SubscriptionPlan[] = ['independent', 'professional', 'shop-owner'];
  const technicianId = technician?.id ?? technician?.technician_id;

  const refetchSubscription = useCallback(async () => {
    if (isDemoMode()) return;
    if (!technicianId) {
      const stored = storage.subscription.get();
      if (stored && VALID_PLANS.includes(stored.plan as SubscriptionPlan)) {
        setSubscription(stored);
      } else {
        setSubscription(null);
      }
      setSubscriptionError(null);
      return;
    }
    try {
      const { data } = await api.get<Record<string, unknown> | { data?: Record<string, unknown> }>(
        `${API.SUBSCRIPTION.CURRENT}?technician_id=${encodeURIComponent(technicianId)}`
      );
      const raw = data && typeof data === 'object' && 'data' in data ? (data as { data?: Record<string, unknown> }).data : (data as Record<string, unknown>);
      const mapped = mapApiSubscriptionToSubscription(raw ?? null);
      setSubscription(mapped);
      setSubscriptionError(null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setSubscriptionError('Could not load subscription.');
      const stored = storage.subscription.get();
      if (stored && VALID_PLANS.includes(stored.plan as SubscriptionPlan)) {
        setSubscription(stored);
      } else {
        setSubscription(null);
      }
    }
  }, [technicianId]);

  useEffect(() => {
    if (isDemoMode()) {
      const stored = storage.subscription.get();
      if (stored && VALID_PLANS.includes(stored.plan as SubscriptionPlan)) {
        setSubscription(stored);
      } else {
        setSubscription(null);
      }
      return;
    }
    refetchSubscription();
  }, [refetchSubscription]);

  useEffect(() => {
    if (subscription) {
      storage.subscription.set(subscription);
    }
  }, [subscription]);

  const subscribe = async (planId: SubscriptionPlan) => {
    setIsLoading(true);
    setSubscriptionError(null);
    try {
      if (isDemoMode()) {
        const newSubscription: Subscription = {
          plan: planId,
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: true,
        };
        setSubscription(newSubscription);
        return;
      }
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      const priceId = plan?.price_id;
      if (priceId) {
        await api.post(API.SUBSCRIPTION.SUBSCRIBE, {
          price_id: priceId,
          technician_id: technicianId || undefined,
        });
      }
      await refetchSubscription();
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscriptionError('Could not subscribe. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    setSubscriptionError(null);
    try {
      if (isDemoMode()) {
        if (subscription) {
          setSubscription({
            ...subscription,
            status: 'cancelled',
            autoRenew: false,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
        return;
      }
      await api.post(API.SUBSCRIPTION.CANCEL, { technician_id: technicianId || undefined });
      await refetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setSubscriptionError('Could not cancel subscription. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (planId: SubscriptionPlan) => {
    setIsLoading(true);
    setSubscriptionError(null);
    try {
      if (isDemoMode()) {
        if (subscription) {
          setSubscription({ ...subscription, plan: planId, status: 'active' });
        }
        return;
      }
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      const priceId = plan?.price_id;
      if (priceId) {
        await api.post(API.SUBSCRIPTION.SUBSCRIBE, {
          price_id: priceId,
          technician_id: technicianId || undefined,
        });
      }
      await refetchSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      setSubscriptionError('Could not update plan. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoRenew = async () => {
    setIsLoading(true);
    setSubscriptionError(null);
    try {
      if (isDemoMode()) {
        if (subscription) {
          setSubscription({ ...subscription, autoRenew: !subscription.autoRenew });
        }
        return;
      }
      if (subscription) {
        setSubscription({ ...subscription, autoRenew: !subscription.autoRenew });
      }
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans: SUBSCRIPTION_PLANS,
        subscribe,
        cancelSubscription,
        updateSubscription,
        toggleAutoRenew,
        refetchSubscription,
        isLoading,
        subscriptionError,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
