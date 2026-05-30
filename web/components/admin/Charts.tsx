'use client';

import React, { useState, useRef, useEffect } from 'react';

// ==========================================
// 1. REVENUE AREA CHART (BEZIER + TOOLTIP CROSSHAIR)
// ==========================================
interface RevenueData {
  date: string;
  revenue: number;
  fees: number;
}

interface RevenueAreaChartProps {
  data: RevenueData[];
}

export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(250);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Handle responsiveness via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width || 500);
        setHeight(entry.contentRect.height || 250);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 italic">
        No revenue data to display
      </div>
    );
  }

  // Find max values for scale calculations
  const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.fees)), 1000) * 1.15;
  const minVal = 0;

  // Chart padding
  const padLeft = 70;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  // Map data to SVG coordinates
  const points = data.map((d, index) => {
    const x = padLeft + (index / (data.length - 1)) * chartWidth;
    const yRevenue = padTop + chartHeight - ((d.revenue - minVal) / (maxVal - minVal)) * chartHeight;
    const yFees = padTop + chartHeight - ((d.fees - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, yRevenue, yFees, ...d };
  });

  // Bezier curve calculations
  const getBezierPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = curr.x + 2 * (next.x - curr.x) / 3;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const revenuePath = getBezierPath(points.map(p => ({ x: p.x, y: p.yRevenue })));
  const feesPath = getBezierPath(points.map(p => ({ x: p.x, y: p.yFees })));

  // Closed paths for background color fills
  const closedRevenuePath = revenuePath
    ? `${revenuePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : '';

  const closedFeesPath = feesPath
    ? `${feesPath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : '';

  // Track mouse coordinates for tooltip placement
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find the closest data coordinate
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    setTooltipPos({
      x: points[closestIdx].x,
      y: points[closestIdx].yRevenue - 20
    });
  };

  // Generate Y axis reference lines
  const yTicks = 4;
  const yAxisTicks = Array.from({ length: yTicks + 1 }).map((_, idx) => {
    const val = minVal + (maxVal - minVal) * (idx / yTicks);
    const y = padTop + chartHeight - (idx / yTicks) * chartHeight;
    return { val, y };
  });

  return (
    <div ref={containerRef} className="relative w-full h-72">
      <svg
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        className="w-full h-full overflow-visible select-none"
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="feesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Background Horizontal Lines */}
        {yAxisTicks.map((tick, idx) => (
          <g key={idx}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              className="stroke-slate-100 dark:stroke-slate-800/80 stroke-1"
            />
            <text
              x={padLeft - 10}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] tabular-nums"
            >
              ₦{Math.round(tick.val).toLocaleString()}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => {
          const parts = p.date.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          let formattedDate = p.date;
          if (parts.length === 3) {
            const mIdx = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            formattedDate = `${months[mIdx]} ${day}`;
          }
          return (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
            >
              {formattedDate}
            </text>
          );
        })}

        {/* Closed Gradient Fills */}
        {closedRevenuePath && <path d={closedRevenuePath} fill="url(#revGrad)" />}
        {closedFeesPath && <path d={closedFeesPath} fill="url(#feesGrad)" />}

        {/* Line Stroke Paths */}
        {revenuePath && (
          <path
            d={revenuePath}
            fill="none"
            className="stroke-cyan-500 dark:stroke-cyan-400 stroke-2"
          />
        )}
        {feesPath && (
          <path
            d={feesPath}
            fill="none"
            className="stroke-blue-500 dark:stroke-blue-400 stroke-2"
          />
        )}

        {/* Active Cursor Hover Crosshairs */}
        {hoverIndex !== null && (
          <g>
            {/* Vertical Marker Line */}
            <line
              x1={points[hoverIndex].x}
              y1={padTop}
              x2={points[hoverIndex].x}
              y2={padTop + chartHeight}
              className="stroke-slate-300 dark:stroke-slate-700 stroke-1 stroke-dasharray-[3_3]"
              strokeDasharray="4 4"
            />
            {/* Highlighted coordinate node points */}
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].yRevenue}
              r="5"
              className="fill-cyan-500 stroke-white dark:stroke-[#161b22] stroke-2"
            />
            <circle
              cx={points[hoverIndex].x}
              cy={points[hoverIndex].yFees}
              r="5"
              className="fill-blue-500 stroke-white dark:stroke-[#161b22] stroke-2"
            />
          </g>
        )}
      </svg>

      {/* HTML Absolute Tooltip Overlay Card */}
      {hoverIndex !== null && (() => {
        const parts = data[hoverIndex].date.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let formattedFull = data[hoverIndex].date;
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const mIdx = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const d = new Date(year, mIdx, day);
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weekday = weekdays[d.getDay()];
          formattedFull = `${weekday}, ${months[mIdx]} ${day}`;
        }
        return (
          <div
            style={{
              left: `${Math.min(Math.max(tooltipPos.x - 70, padLeft), width - 150)}px`,
              top: `${Math.max(tooltipPos.y - 65, 0)}px`
            }}
            className="absolute z-10 pointer-events-none p-2.5 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg text-xs transition-all duration-100 ease-out font-sans"
          >
            <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1 select-none">
              {formattedFull}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Gross Rev:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] tabular-nums">
                  ₦{data[hoverIndex].revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Fee Margin:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] tabular-nums">
                  ₦{data[hoverIndex].fees.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};


// ==========================================
// 2. SERVICE CATEGORY DONUT CHART (SCALING RING)
// ==========================================
interface DonutData {
  label: string;
  value: number;
  color: string;
}

interface ServiceDonutChartProps {
  data: DonutData[];
}

export const ServiceDonutChart: React.FC<ServiceDonutChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // SVG dimensions
  const size = 180;
  const center = size / 2;
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Segment offset computation
  let accumulatedAngle = 0;
  const segments = data.map((d, index) => {
    const percentage = total > 0 ? d.value / total : 0;
    const strokeDashoffset = circumference - percentage * circumference;
    const rotation = accumulatedAngle * 360 - 90;
    accumulatedAngle += percentage;
    return {
      strokeDashoffset,
      rotation,
      percentage,
      ...d
    };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full font-sans">
      
      {/* Dynamic Visual Ring Canvas */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible select-none">
          {segments.map((seg, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeDashoffset}
                transform={`rotate(${seg.rotation} ${center} ${center})`}
                className="transition-all duration-300 cursor-pointer ease-out-back"
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Text displaying sum float */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {activeIndex !== null ? segments[activeIndex].label : 'Total Volume'}
          </span>
          <span className="text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono tabular-nums mt-1 leading-none">
            ₦{Math.round(activeIndex !== null ? segments[activeIndex].value : total).toLocaleString()}
          </span>
          {activeIndex !== null && (
            <span className="text-[11px] font-bold text-cyan-500 font-mono mt-1 leading-none">
              {(segments[activeIndex].percentage * 100).toFixed(1)}% share
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Bento Grid Legend */}
      <div className="w-full mt-4 grid grid-cols-3 gap-2 px-1">
        {data.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center gap-1.5 p-1 rounded-lg transition-colors cursor-pointer ${
              activeIndex === idx ? 'bg-slate-50 dark:bg-slate-800/60' : ''
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <div className="min-w-0 text-left">
              <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">
                {item.label}
              </div>
              <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 leading-none">
                {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};


// ==========================================
// 3. DAILY SUCCESS BAR CHART (GREEN VS RED GROUP)
// ==========================================
interface DailyData {
  day: string;
  successful: number;
  failed: number;
}

interface DailySuccessBarChartProps {
  data: DailyData[];
}

export const DailySuccessBarChart: React.FC<DailySuccessBarChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(250);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverType, setHoverType] = useState<'success' | 'failed' | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Handle responsiveness via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width || 600);
        setHeight(entry.contentRect.height || 250);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 italic">
        No transaction statistics to display
      </div>
    );
  }

  // Scaling limits
  const maxCount = Math.max(...data.map(d => d.successful + d.failed), 10) * 1.1;

  // Chart padding
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const colWidth = chartWidth / data.length;
  const barWidth = Math.max(colWidth * 0.32, 8);
  const barGap = 4;

  return (
    <div ref={containerRef} className="relative w-full h-64 font-sans">
      <svg width={width} height={height} className="w-full h-full overflow-visible select-none">
        
        {/* Horizontal grid guide lines */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const y = padTop + (idx / 3) * chartHeight;
          const val = Math.round(maxCount - (idx / 3) * maxCount);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                className="stroke-slate-100 dark:stroke-slate-800/80 stroke-1"
              />
              <text
                x={padLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] tabular-nums"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {data.map((d, idx) => {
          const centerX = padLeft + idx * colWidth + colWidth / 2;
          
          // Coordinate heights
          const successHeight = (d.successful / maxCount) * chartHeight;
          const failedHeight = (d.failed / maxCount) * chartHeight;
          
          const successY = padTop + chartHeight - successHeight;
          const failedY = padTop + chartHeight - failedHeight;

          // X coords for success vs failed bar positioning
          const successX = centerX - barWidth - barGap / 2;
          const failedX = centerX + barGap / 2;

          return (
            <g key={idx}>
              {/* 1. Successful Bar (Green/Emerald) */}
              <rect
                x={successX}
                y={successY}
                width={barWidth}
                height={successHeight}
                rx="4"
                className={`fill-emerald-500 dark:fill-emerald-600 cursor-pointer transition-all duration-200 ${
                  hoverIndex === idx && hoverType === 'success' ? 'brightness-110 opacity-100 scale-x-105 origin-center' : 'opacity-90'
                }`}
                onMouseEnter={(e) => {
                  setHoverIndex(idx);
                  setHoverType('success');
                  setTooltipPos({ x: successX + barWidth / 2, y: successY });
                }}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setHoverType(null);
                }}
              />

              {/* 2. Failed Bar (Red/Rose) */}
              <rect
                x={failedX}
                y={failedY}
                width={barWidth}
                height={failedHeight}
                rx="4"
                className={`fill-rose-500 dark:fill-rose-600 cursor-pointer transition-all duration-200 ${
                  hoverIndex === idx && hoverType === 'failed' ? 'brightness-110 opacity-100 scale-x-105 origin-center' : 'opacity-90'
                }`}
                onMouseEnter={(e) => {
                  setHoverIndex(idx);
                  setHoverType('failed');
                  setTooltipPos({ x: failedX + barWidth / 2, y: failedY });
                }}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setHoverType(null);
                }}
              />

              {/* Day Name Label */}
              <text
                x={centerX}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip Card Overlay */}
      {hoverIndex !== null && hoverType !== null && (
        <div
          style={{
            left: `${Math.min(Math.max(tooltipPos.x - 65, padLeft), width - 140)}px`,
            top: `${Math.max(tooltipPos.y - 75, 0)}px`
          }}
          className="absolute z-10 pointer-events-none p-2 bg-white dark:bg-[#1c2128] border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg text-xs font-sans transition-all duration-100"
        >
          <div className="font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {data[hoverIndex].day} Statistics
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Successful:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] tabular-nums">
                {data[hoverIndex].successful} tx
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Failed:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] tabular-nums">
                {data[hoverIndex].failed} tx
              </span>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Success Rate:</span>
              <span className="font-extrabold text-cyan-500 font-mono text-[11px]">
                {Math.round(
                  (data[hoverIndex].successful / (data[hoverIndex].successful + data[hoverIndex].failed || 1)) * 100
                )}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
