import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';

export interface GlobalTransactionAnalyticsParams {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  by: 'D' | 'M' | 'Y';
}

/**
 * Get global aggregate transaction stats for a date range.
 * GET /analytics/transactions/global
 */
export async function getGlobalTransactionAnalytics(
  params: GlobalTransactionAnalyticsParams
): Promise<Record<string, any>> {
  try {
    const search = new URLSearchParams();
    search.set('from', params.from);
    search.set('to', params.to);
    search.set('by', params.by);

    const url = `${API.ANALYTICS.TRANSACTIONS_GLOBAL}?${search.toString()}`;
    const { data } = await api.get<unknown>(url);
    
    // Unwrap envelope if present
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as any).data;
    }
    return data as Record<string, any>;
  } catch (err) {
    console.warn("Global analytics error:", getApiErrorMessage(err));
    return {};
  }
}

/**
 * Get recent activity stats derived from cached global analytics.
 * GET /analytics/transactions/recent
 */
export async function getRecentTransactionAnalytics(): Promise<Record<string, any>> {
  try {
    const { data } = await api.get<unknown>(API.ANALYTICS.TRANSACTIONS_RECENT);
    
    // Unwrap envelope if present
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as any).data;
    }
    return data as Record<string, any>;
  } catch (err) {
    console.warn("Recent analytics error:", getApiErrorMessage(err));
    return {};
  }
}
