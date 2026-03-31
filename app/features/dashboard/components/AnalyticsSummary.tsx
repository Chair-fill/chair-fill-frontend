import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";

interface MetricProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}

const Metric = ({ label, value, change, trend, icon: Icon }: MetricProps) => (
  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon className="w-24 h-24" />
    </div>
    
    <div className="flex items-start justify-between relative z-10">
      <div className="p-2 bg-primary/10 rounded-xl">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
        trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
      }`}>
        {trend === 'up' ? '+' : ''}{change}%
      </div>
    </div>
    
    <div className="mt-4 relative z-10">
      <p className="text-sm font-medium text-foreground/60">{label}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default function AnalyticsSummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric 
        label="Total Revenue" 
        value="$4,280.00" 
        change="12.5" 
        trend="up" 
        icon={DollarSign}
      />
      <Metric 
        label="Total Bookings" 
        value="124" 
        change="8.2" 
        trend="up" 
        icon={Calendar}
      />
      <Metric 
        label="Avg. Booking Value" 
        value="$34.50" 
        change="3.1" 
        trend="down" 
        icon={TrendingUp}
      />
      <Metric 
        label="Client Retention" 
        value="84%" 
        change="5.4" 
        trend="up" 
        icon={Users}
      />
    </div>
  );
}
