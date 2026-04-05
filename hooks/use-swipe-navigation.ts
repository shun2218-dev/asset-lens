"use client";

import { useCallback, useRef } from "react";

interface SwipeConfig {
  /** Minimum horizontal distance (px) to register a swipe */
  threshold?: number;
  /** Called when user swipes right (→), typically "go back / previous" */
  onSwipeRight?: () => void;
  /** Called when user swipes left (←), typically "go forward / next" */
  onSwipeLeft?: () => void;
}

/**
 * Detects horizontal swipe gestures on a target element.
 * Ignores vertical-dominant swipes to prevent conflicting with scroll.
 */
export function useSwipeNavigation({
  threshold = 50,
  onSwipeRight,
  onSwipeLeft,
}: SwipeConfig) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;
      const elapsed = Date.now() - startTime.current;

      // Ignore if too slow (> 500ms) or vertical-dominant movement
      if (elapsed > 500) return;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < threshold) return;

      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    },
    [threshold, onSwipeRight, onSwipeLeft],
  );

  return { onTouchStart, onTouchEnd };
}
