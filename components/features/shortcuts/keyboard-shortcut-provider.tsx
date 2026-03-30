"use client";

import dynamic from "next/dynamic";
import { useNavigationShortcuts } from "@/hooks/use-keyboard-shortcuts";

const ShortcutHelpDialog = dynamic(
  () =>
    import("@/components/features/shortcuts/shortcut-help-dialog").then(
      (mod) => mod.ShortcutHelpDialog,
    ),
  { ssr: false },
);

interface KeyboardShortcutProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutProvider({
  children,
}: KeyboardShortcutProviderProps) {
  useNavigationShortcuts();

  return (
    <>
      {children}
      <ShortcutHelpDialog />
    </>
  );
}
