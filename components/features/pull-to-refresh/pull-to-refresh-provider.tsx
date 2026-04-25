"use client";

import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

interface PullToRefreshProviderProps {
  children: ReactNode;
}

/**
 * Wraps page content to enable pull-to-refresh on mobile.
 * Shows an animated indicator when the user pulls down.
 */
export function PullToRefreshProvider({
  children,
}: PullToRefreshProviderProps) {
  const { pullDistance, isRefreshing, isThresholdReached, handlers } =
    usePullToRefresh();

  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div {...handlers}>
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
          style={{ height: pullDistance }}
        >
          <div className="flex flex-col items-center gap-1">
            <RefreshCw
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              style={{
                transform: isRefreshing
                  ? undefined
                  : `rotate(${(pullDistance / 60) * 180}deg)`,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {isRefreshing
                ? "更新中..."
                : isThresholdReached
                  ? "離して更新"
                  : "引っ張って更新"}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
