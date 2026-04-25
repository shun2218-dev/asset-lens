"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Switch theme with an optional circular clip-path animation
 * powered by the View Transition API.
 */
function useAnimatedTheme() {
  const { setTheme, theme } = useTheme();

  const switchTheme = useCallback(
    (newTheme: string, event?: React.MouseEvent) => {
      // Fallback: just set the theme if the API is unavailable
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(newTheme);
        return;
      }

      // Get click coordinates for the circle origin
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? 0;

      // Calculate the maximum radius so the circle covers the whole viewport
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      // Set CSS variables for the animation origin
      document.documentElement.style.setProperty("--vt-x", `${x}px`);
      document.documentElement.style.setProperty("--vt-y", `${y}px`);
      document.documentElement.style.setProperty("--vt-r", `${maxRadius}px`);

      const transition = document.startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.ready.then(() => {
        document.documentElement.classList.add("theme-transitioning");
      });

      transition.finished.then(() => {
        document.documentElement.classList.remove("theme-transitioning");
        document.documentElement.style.removeProperty("--vt-x");
        document.documentElement.style.removeProperty("--vt-y");
        document.documentElement.style.removeProperty("--vt-r");
      });
    },
    [setTheme],
  );

  return { theme, switchTheme };
}

export function ThemeToggle() {
  const { switchTheme, theme } = useAnimatedTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">テーマ切り替え</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">テーマ切り替え</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => switchTheme("light", e)}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          ライト
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => switchTheme("dark", e)}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          ダーク
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => switchTheme("system", e)}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          システム
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
