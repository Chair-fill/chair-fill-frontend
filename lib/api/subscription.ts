import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import type { Subscription, SubscriptionPlan } from '@/lib/types/subscription';

const VALID_PLANS: SubscriptionPlan[] = ['independent', 'professional', 'shop-owner'];

function normalizePlan(plan: unknown): SubscriptionPlan | null {
  if (typeof plan === 'string') {
    const lower = plan.toLowerCase();
    return VALID_PLANS.includes(lower as SubscriptionPlan) ? (lower as SubscriptionPlan) : null;
  }
  if (plan && typeof plan === 'object' && 'name' in plan && typeof (plan as { name: string }).name === 'string') {
    const name = ((plan as { name: string }).name || '').toLowerCase();
    return VALID_PLANS.includes(name as SubscriptionPlan) ? (name as SubscriptionPlan) : null;
  }
  return null;
}

function normalizeStatus(subscriptionStatus: unknown): Subscription['status'] {
  const s = String(subscriptionStatus ?? '').toLowerCase();
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  if (s === 'expired') return 'expired';
  if (s === 'trialing' || s === 'trial') return 'trial';
  return 'active'; // subscribed, active, etc.
}

function mapApiSubscriptionToSubscription(raw: Record<string, unknown> | null): Subscription | null {
  if (!raw || typeof raw !== 'object') return null;
  const plan = normalizePlan(raw.plan ?? raw.plan_id);
  if (!plan) return null;
  const status = normalizeStatus(raw.subscription_status ?? raw.status);
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

/** Fetch current subscription (GET /subscription/current?technician_id=...). */
export async function fetchCurrentSubscription(technicianId: string): Promise<Subscription | null> {
  const { data } = await api.get<Record<string, unknown> | { data?: Record<string, unknown> }>(
    `${API.SUBSCRIPTION.CURRENT}?technician_id=${encodeURIComponent(technicianId)}`
  );
  const raw = data && typeof data === 'object' && 'data' in data ? (data as { data?: Record<string, unknown> }).data : (data as Record<string, unknown>);
  return mapApiSubscriptionToSubscription(raw ?? null);
}

export const SUBSCRIPTION_QUERY_KEY = ['subscription'] as const;
