"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

interface PullToRefreshConfig {
  /** Minimum pull distance to trigger refresh (px) */
  threshold?: number;
  /** Maximum pull indicator translation (px) */
  maxPull?: number;
}

interface PullToRefreshState {
  /** Current pull distance (0 when not pulling) */
  pullDistance: number;
  /** Whether we're actively refreshing */
  isRefreshing: boolean;
  /** Whether the threshold has been reached */
  isThresholdReached: boolean;
}

/**
 * Hook for pull-to-refresh gesture detection.
 * Only activates when scrolled to the top of the page.
 */
export function usePullToRefresh({
  threshold = 60,
  maxPull = 100,
}: PullToRefreshConfig = {}) {
  const router = useRouter();
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    isThresholdReached: false,
  });

  const startY = useRef(0);
  const isPulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only activate when at the top of the page
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || state.isRefreshing) return;
      if (window.scrollY > 0) {
        isPulling.current = false;
        setState((s) => ({ ...s, pullDistance: 0, isThresholdReached: false }));
        return;
      }

      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY <= 0) return;

      // Apply resistance: the further you pull, the harder it gets
      const resistance = 0.4;
      const pull = Math.min(deltaY * resistance, maxPull);

      setState({
        pullDistance: pull,
        isRefreshing: false,
        isThresholdReached: pull >= threshold,
      });
    },
    [maxPull, threshold, state.isRefreshing],
  );

  const onTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (state.isThresholdReached && !state.isRefreshing) {
      setState({
        pullDistance: threshold,
        isRefreshing: true,
        isThresholdReached: true,
      });
      router.refresh();
      // Reset after a short delay to show the spinner
      setTimeout(() => {
        setState({
          pullDistance: 0,
          isRefreshing: false,
          isThresholdReached: false,
        });
      }, 800);
    } else {
      setState({
        pullDistance: 0,
        isRefreshing: false,
        isThresholdReached: false,
      });
    }
  }, [state.isThresholdReached, state.isRefreshing, threshold, router]);

  return {
    ...state,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
