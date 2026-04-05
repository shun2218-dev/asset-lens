"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";
import {
  OnboardingTour,
  resetOnboardingTour,
} from "@/components/features/onboarding/onboarding-tour";
import { Button } from "@/components/ui/button";

/**
 * Button and trigger to replay the onboarding feature tour.
 * Shown in Settings → Account tab.
 */
export function ReplayTourButton() {
  const [showTour, setShowTour] = useState(false);

  const handleReplay = () => {
    resetOnboardingTour();
    setShowTour(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleReplay}
      >
        <BookOpen className="h-4 w-4" />
        使い方ガイドを見る
      </Button>
      {showTour && (
        <OnboardingTour forceShow onComplete={() => setShowTour(false)} />
      )}
    </>
  );
}
