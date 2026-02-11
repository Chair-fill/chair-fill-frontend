'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTechnician } from '@/app/providers/TechnicianProvider';
import { fetchCurrentSubscription, SUBSCRIPTION_QUERY_KEY } from '@/lib/api/subscription';
import { isDemoMode } from '@/lib/demo';

/**
 * Prefetches current subscription when technician is available so that the
 * subscription page can show the active subscription without waiting for the fetch.
 */
export default function SubscriptionPrefetcher() {
  const queryClient = useQueryClient();
  const { technician } = useTechnician();
  const technicianId = technician?.id ?? technician?.technician_id;

  useEffect(() => {
    if (isDemoMode() || !technicianId) return;
    queryClient.prefetchQuery({
      queryKey: [...SUBSCRIPTION_QUERY_KEY, technicianId],
      queryFn: () => fetchCurrentSubscription(technicianId),
    });
  }, [queryClient, technicianId]);

  return null;
}
