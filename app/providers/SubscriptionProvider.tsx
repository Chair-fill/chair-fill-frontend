'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Subscription, SubscriptionPlan, PlanDetails } from '@/lib/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription';
import { storage } from '@/lib/utils/storage';

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: PlanDetails[];
  subscribe: (planId: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateSubscription: (planId: SubscriptionPlan) => Promise<void>;
  toggleAutoRenew: () => Promise<void>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load subscription from localStorage on mount
  useEffect(() => {
    const stored = storage.subscription.get();
    if (stored) {
      setSubscription(stored);
    } else {
      // Default to free plan if no subscription exists
      const defaultSubscription: Subscription = {
        plan: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
        autoRenew: false,
      };
      setSubscription(defaultSubscription);
    }
  }, []);

  // Save subscription to localStorage whenever it changes
  useEffect(() => {
    if (subscription) {
      storage.subscription.set(subscription);
    }
  }, [subscription]);

  const subscribe = async (planId: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSubscription: Subscription = {
        plan: planId,
        status: 'active',
        startDate: new Date().toISOString(),
        autoRenew: true,
      };
      
      setSubscription(newSubscription);
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'cancelled',
          autoRenew: false,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (planId: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          plan: planId,
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoRenew = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          autoRenew: !subscription.autoRenew,
        });
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
        isLoading,
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
