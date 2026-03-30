"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutHandler[],
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? e.metaKey || e.ctrlKey : true;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch) {
          if (shortcut.meta || shortcut.ctrl) {
            e.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Sequence-based shortcuts (e.g., G then D for dashboard).
 * First key press starts the sequence, second key completes it.
 */
export function useSequenceShortcuts(
  sequences: Record<string, () => void>,
  prefix: string,
  enabled = true,
) {
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      const key = e.key.toLowerCase();

      if (pendingRef.current) {
        pendingRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);

        const handler = sequences[key];
        if (handler) {
          e.preventDefault();
          handler();
        }
        return;
      }

      if (key === prefix.toLowerCase()) {
        pendingRef.current = true;
        timerRef.current = setTimeout(() => {
          pendingRef.current = false;
        }, 1000);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sequences, prefix, enabled]);
}

/**
 * Pre-built navigation shortcuts: G then D/T/S
 */
export function useNavigationShortcuts(enabled = true) {
  const router = useRouter();

  const sequences = useCallback(
    () => ({
      d: () => router.push("/dashboard"),
      t: () => router.push("/transaction"),
      s: () => router.push("/settings"),
    }),
    [router],
  );

  useSequenceShortcuts(sequences(), "g", enabled);
}
