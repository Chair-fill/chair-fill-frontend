"use client";

import { useMemo } from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
}

export default function RevenueChart({ data, height = 300 }: RevenueChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const padding = 40;
  
  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return { x, y };
    });
  }, [data, maxValue]);

  const pathData = useMemo(() => {
    if (points.length === 0) return "";
    return `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const areaData = useMemo(() => {
    if (points.length === 0) return "";
    return `${pathData} L 100 100 L 0 100 Z`;
  }, [pathData, points]);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-foreground/60">Revenue trends for the last 7 days</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-foreground/60">Revenue</span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height }}>
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-bold text-foreground/40 pr-4 border-r border-border/50">
          <span>${Math.round(maxValue)}</span>
          <span>${Math.round(maxValue / 2)}</span>
          <span>$0</span>
        </div>

        {/* Chart SVG */}
        <div className="ml-10 h-full relative">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            {/* Grid Lines */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.1" className="text-border/30" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" className="text-border/30" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.1" className="text-border/30" />

            {/* Area under the line */}
            <path
              d={areaData}
              fill="url(#gradient)"
              className="transition-all duration-700 ease-in-out"
            />
            
            {/* The Line */}
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary transition-all duration-700 ease-in-out"
              style={{ filter: "drop-shadow(0px 4px 8px rgba(212,175,55,0.3))" }}
            />

            {/* Data Points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.5"
                className="fill-primary border-4 border-background hover:r-2 transition-all cursor-pointer"
              />
            ))}

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="absolute left-10 right-0 bottom-[-24px] flex justify-between text-[10px] font-bold text-foreground/40">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
