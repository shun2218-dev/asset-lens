"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  PieChart,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "assetlens-tour-completed";

interface TourStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: <ArrowLeftRight className="h-10 w-10 text-blue-500" />,
    title: "スワイプで月を切り替え",
    description:
      "ダッシュボードを左右にスワイプすると、前月・翌月に簡単に切り替えられます。",
    tip: "←  スワイプ →",
  },
  {
    icon: <ArrowDownToLine className="h-10 w-10 text-emerald-500" />,
    title: "引っ張って更新",
    description: "画面のトップで下に引っ張ると、最新のデータに更新できます。",
    tip: "↓  プルダウン",
  },
  {
    icon: <Moon className="h-10 w-10 text-indigo-500" />,
    title: "ダークモード切り替え",
    description:
      "ヘッダーの月アイコンからテーマを切り替えられます。円形のアニメーションで切り替わります。",
  },
  {
    icon: <PieChart className="h-10 w-10 text-amber-500" />,
    title: "予算リング",
    description:
      "設定で予算を登録すると、円形のリングで消化率をリアルタイムに見える化します。",
  },
  {
    icon: <Calendar className="h-10 w-10 text-green-500" />,
    title: "支出ヒートマップ",
    description:
      "カレンダー形式で日別の支出を色の濃さで表示。お金の使い方のパターンが一目でわかります。",
  },
  {
    icon: <Download className="h-10 w-10 text-violet-500" />,
    title: "ホーム画面に追加",
    description:
      "ブラウザのメニューから「ホーム画面に追加」すると、ネイティブアプリのように使えます。",
    tip: "PWA対応済み",
  },
];

interface OnboardingTourProps {
  /** Force show the tour (e.g. from help page) */
  forceShow?: boolean;
  /** Called when tour is dismissed */
  onComplete?: () => void;
}

export function OnboardingTour({
  forceShow = false,
  onComplete,
}: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }

    // Show tour only if not yet completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let the page settle
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleSkip}
      />

      {/* Tour card */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="ツアーをスキップ"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pt-8 pb-4 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold mb-2">{step.title}</h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {/* Tip badge */}
          {step.tip && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
              {step.tip}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                戻る
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                スキップ
              </Button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={`tour-dot-${TOUR_STEPS[i].title}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {isLast ? (
              "はじめる"
            ) : (
              <>
                次へ
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Resets the tour so it will show again on next page load.
 * Call this from settings/help to let users replay the tour.
 */
export function resetOnboardingTour() {
  localStorage.removeItem(STORAGE_KEY);
}
