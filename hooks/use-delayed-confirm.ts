import { useEffect, useState } from "react";

/**
 * Delays enabling a confirm button to prevent accidental double-clicks.
 * Returns `true` while the timer is running (button should be disabled).
 */
export function useDelayedConfirm(open: boolean, delayMs = 500) {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    if (!open) {
      setLocked(true);
      return;
    }
    const id = setTimeout(() => setLocked(false), delayMs);
    return () => clearTimeout(id);
  }, [open, delayMs]);

  return locked;
}
