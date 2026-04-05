"use client";

import { useEffect, useRef, useState } from "react";

interface BudgetRingProps {
  /** Amount spent so far */
  spent: number;
  /** Budget limit */
  limit: number;
  /** Size of the SVG in pixels */
  size?: number;
  /** Stroke width of the ring */
  strokeWidth?: number;
}

/**
 * Circular SVG progress ring for budget consumption.
 * Color shifts from green → yellow → red as spending increases.
 * Features animated stroke fill and count-up percentage.
 */
export function BudgetRing({
  spent,
  limit,
  size = 140,
  strokeWidth = 10,
}: BudgetRingProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const rafRef = useRef<number>(0);

  const rawPercent = limit > 0 ? (spent / limit) * 100 : 0;
  const percent = Math.min(rawPercent, 100);

  // Determine color based on budget usage with gradient feel
  const getColor = (p: number) => {
    if (p >= 90) return "hsl(0, 72%, 51%)"; // red
    if (p >= 70) return "hsl(38, 92%, 50%)"; // amber
    return "hsl(152, 69%, 41%)"; // emerald
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  // Days remaining in current month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();

  // Animate count-up on mount
  useEffect(() => {
    const duration = 800; // ms
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedPercent(Math.round(eased * rawPercent));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rawPercent]);

  const color = getColor(percent);
  const isOver = rawPercent > 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          role="img"
          aria-label={`予算消化率 ${Math.round(rawPercent)}%`}
        >
          <title>{`予算消化率 ${Math.round(rawPercent)}%`}</title>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {animatedPercent}%
          </span>
          {isOver && (
            <span className="text-[10px] font-medium text-red-500">
              予算超過
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">残り{daysRemaining}日</p>
    </div>
  );
}
