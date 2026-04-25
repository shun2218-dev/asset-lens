"use client";

import { addMonths, format, isAfter, isSameMonth, parse } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { OnboardingTour } from "@/components/features/onboarding/onboarding-tour";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

interface DashboardSwipeWrapperProps {
  currentMonth: string;
  children: ReactNode;
}

/**
 * Wraps dashboard content to enable swipe-based month navigation.
 * Swipe right → previous month, swipe left → next month.
 */
export function DashboardSwipeWrapper({
  currentMonth,
  children,
}: DashboardSwipeWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  const today = new Date();
  const currentDate = parse(currentMonth, "yyyy-MM", new Date());
  const isNextDisabled =
    isSameMonth(currentDate, today) || isAfter(currentDate, today);

  const navigate = useCallback(
    (offset: number) => {
      const nextDate = addMonths(currentDate, offset);
      const nextMonthStr = format(nextDate, "yyyy-MM");
      router.push(`${pathname}?month=${nextMonthStr}`);
    },
    [currentDate, pathname, router],
  );

  const { onTouchStart, onTouchEnd } = useSwipeNavigation({
    onSwipeRight: () => navigate(-1),
    onSwipeLeft: isNextDisabled ? undefined : () => navigate(1),
  });

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <OnboardingTour />
      {children}
    </div>
  );
}
