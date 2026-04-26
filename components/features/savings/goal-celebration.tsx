"use client";

import { useEffect, useState } from "react";

interface GoalCelebrationProps {
  /** Whether to show the celebration */
  show: boolean;
  /** Goal name to display */
  goalName: string;
  /** Called when animation completes */
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

/**
 * Celebration overlay with confetti animation when a savings goal is reached.
 */
export function GoalCelebration({
  show,
  goalName,
  onComplete,
}: GoalCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!show) return;

    setVisible(true);
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
      })),
    );

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      role="alert"
      aria-live="assertive"
    >
      {/* Confetti particles */}
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}s`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.id % 3 === 0 ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {/* Celebration message */}
      <div className="relative z-10 text-center space-y-4 animate-in zoom-in-95 duration-500">
        <div className="text-6xl animate-bounce">🎉</div>
        <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl px-8 py-6 shadow-2xl backdrop-blur">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            目標達成!
          </h2>
          <p className="mt-2 text-muted-foreground">
            「{goalName}」を達成しました！
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            おめでとうございます 🎊
          </p>
        </div>
      </div>
    </div>
  );
}
