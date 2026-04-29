"use client";

import { TrendingUp, Users, Calendar, DollarSign, Eye, EyeOff } from "lucide-react";
import { useBalanceVisibility, BALANCE_MASK } from "@/lib/hooks/use-balance-visibility";
import { useUser } from "@/app/providers/UserProvider";
import { useQuery } from "@tanstack/react-query";
import { getRecentTransactionAnalytics } from "@/lib/api/analytics";

interface MetricProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  /** When true, the value is masked while balance visibility is hidden. */
  monetary?: boolean;
  /** When true, render the eye toggle on this card (use on the primary monetary card). */
  showVisibilityToggle?: boolean;
}

const Metric = ({ label, value, change, trend, icon: Icon, monetary = false, showVisibilityToggle = false }: MetricProps) => {
  const { hidden, toggle } = useBalanceVisibility();
  const displayValue = monetary && hidden ? BALANCE_MASK : value;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Icon className="w-24 h-24" />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend === 'up' ? '+' : ''}{change}%
          </div>
          {showVisibilityToggle && (
            <button
              type="button"
              onClick={toggle}
              aria-label={hidden ? "Show amounts" : "Hide amounts"}
              aria-pressed={hidden}
              title={hidden ? "Show amounts" : "Hide amounts"}
              className="p-1.5 rounded-full text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              {hidden ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-sm font-medium text-foreground/60">{label}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{displayValue}</h3>
      </div>
    </div>
  );
};

export default function AnalyticsSummary() {
  const { user } = useUser();

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'recent', user?.id],
    queryFn: getRecentTransactionAnalytics,
    enabled: !!user?.id,
  });

  // Helper to format money safely
  const toAmount = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Extract from analytics if present, else fallback to placeholders
  const totalRevenue = analyticsData?.total_earned ? `$${toAmount(analyticsData.total_earned).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00";
  const revenueChange = analyticsData?.revenue_change ?? "0.0";
  const revenueTrend = parseFloat(revenueChange) >= 0 ? "up" : "down";

  const totalBookings = analyticsData?.total_bookings ?? "0";
  const bookingsChange = analyticsData?.bookings_change ?? "0.0";
  const bookingsTrend = parseFloat(bookingsChange) >= 0 ? "up" : "down";

  const avgBooking = analyticsData?.avg_booking_value ? `$${toAmount(analyticsData.avg_booking_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00";
  const avgBookingChange = analyticsData?.avg_booking_change ?? "0.0";
  const avgBookingTrend = parseFloat(avgBookingChange) >= 0 ? "up" : "down";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric
        label="Total Revenue"
        value={totalRevenue}
        change={revenueChange.toString()}
        trend={revenueTrend}
        icon={DollarSign}
        monetary
        showVisibilityToggle
      />
      <Metric
        label="Total Bookings"
        value={totalBookings.toString()}
        change={bookingsChange.toString()}
        trend={bookingsTrend}
        icon={Calendar}
      />
      <Metric
        label="Avg. Booking Value"
        value={avgBooking}
        change={avgBookingChange.toString()}
        trend={avgBookingTrend}
        icon={TrendingUp}
        monetary
      />
      <Metric
        label="Client Retention"
        value={analyticsData?.client_retention ? `${analyticsData.client_retention}%` : "0%"}
        change={analyticsData?.retention_change?.toString() ?? "0.0"}
        trend={parseFloat(analyticsData?.retention_change ?? "0") >= 0 ? "up" : "down"}
        icon={Users}
      />
    </div>
  );
}
