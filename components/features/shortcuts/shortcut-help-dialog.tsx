"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "一般",
    shortcuts: [
      { keys: ["⌘", "K"], description: "取引をすばやく記録" },
      { keys: ["?"], description: "ショートカット一覧を表示" },
    ],
  },
  {
    title: "ナビゲーション",
    shortcuts: [
      { keys: ["G", "D"], description: "ダッシュボードへ移動" },
      { keys: ["G", "T"], description: "取引一覧へ移動" },
      { keys: ["G", "S"], description: "設定へ移動" },
    ],
  },
];

export function ShortcutHelpDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[480px]"
        id="shortcut-help-dialog"
        aria-describedby="shortcut-help-description"
      >
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
        </DialogHeader>
        <p id="shortcut-help-description" className="sr-only">
          利用可能なキーボードショートカットの一覧です
        </p>
        <div className="space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={`${shortcut.description}-${key}-${i}`}>
                          {i > 0 && (
                            <span className="text-muted-foreground mx-0.5 text-xs">
                              then
                            </span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 bg-muted border border-border rounded-md text-xs font-mono font-medium shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
