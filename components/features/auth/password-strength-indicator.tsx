"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

type Strength = "empty" | "weak" | "fair" | "good" | "strong";

function getStrength(password: string): Strength {
  if (!password) return "empty";

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  if (score <= 3) return "good";
  return "strong";
}

const strengthConfig: Record<
  Exclude<Strength, "empty">,
  { label: string; color: string; bars: number }
> = {
  weak: { label: "弱い", color: "bg-red-500", bars: 1 },
  fair: { label: "まあまあ", color: "bg-orange-500", bars: 2 },
  good: { label: "良い", color: "bg-yellow-500", bars: 3 },
  strong: { label: "強い", color: "bg-green-500", bars: 4 },
};

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (strength === "empty") return null;

  const config = strengthConfig[strength];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`bar-${idx.toString()}`}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              idx < config.bars ? config.color : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        パスワード強度: <span className="font-medium">{config.label}</span>
      </p>
    </div>
  );
}
