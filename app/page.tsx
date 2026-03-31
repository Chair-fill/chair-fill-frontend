"use client";

import AnalyticsSummary from "@/app/features/dashboard/components/AnalyticsSummary";
import RevenueChart from "@/app/features/dashboard/components/RevenueChart";
import { Calendar, Download, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { exportToPDF } from "@/lib/utils/export-pdf";

const mockRevenueData = [
  { label: "Mon", value: 320 },
  { label: "Tue", value: 450 },
  { label: "Wed", value: 410 },
  { label: "Thu", value: 600 },
  { label: "Fri", value: 550 },
  { label: "Sat", value: 850 },
  { label: "Sun", value: 720 },
];

export default function HomePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF('dashboard-content', 'Chairfill-Analytics-Report');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-4 sm:pt-8 pb-32 sm:pb-8">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div id="dashboard-content" className="max-w-7xl mx-auto space-y-8 bg-background p-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-foreground/60">
                Monitor your business performance and growth.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/5 border border-white/10 rounded-full text-foreground hover:bg-white/10 transition-all active:scale-95"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-foreground hover:bg-white/10 transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold">Last 7 Days</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="text-sm font-bold">
                  {isExporting ? "Generating..." : "Export PDF"}
                </span>
              </button>
            </div>
          </div>

          {/* Metrics Summary */}
          <AnalyticsSummary />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RevenueChart data={mockRevenueData} />
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Top Services</h3>
                <p className="text-sm text-foreground/60 mb-6 font-medium">Most popular services by revenue</p>
                
                <div className="space-y-6">
                  {[
                    { name: 'Skin Fade', value: 45, color: 'bg-primary' },
                    { name: 'Full Service', value: 30, color: 'bg-blue-500' },
                    { name: 'Beard Trim', value: 15, color: 'bg-emerald-500' },
                    { name: 'Hair Wash', value: 10, color: 'bg-amber-500' },
                  ].map((service) => (
                    <div key={service.name} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-foreground">{service.name}</span>
                        <span className="text-foreground/60">{service.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${service.color} rounded-full transition-all duration-1000`} 
                          style={{ width: `${service.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Insight</p>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  Your "Skin Fade" bookings are up 15% this week. Consider promoting it as a featured service.
                </p>
              </div>
            </div>
          </div>

          {/* Activity Section Placeholder */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-foreground mb-6">Recent Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'New Clients', value: '+12', desc: 'Highest growth this month' },
                { title: 'Cancellations', value: '2%', desc: 'Lower than industry average' },
                { title: 'Peak Hours', value: '2 PM - 5 PM', desc: 'Weekend slots are fully booked' },
              ].map((trend) => (
                <div key={trend.title} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-tight">{trend.title}</p>
                  <p className="text-xl font-bold text-foreground">{trend.value}</p>
                  <p className="text-[10px] text-foreground/60 font-medium">{trend.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
