import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { OnboardingTour } from "./onboarding-tour";

const meta: Meta<typeof OnboardingTour> = {
  title: "Features/Onboarding/OnboardingTour",
  component: OnboardingTour,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Modal carousel onboarding tour introducing key app features. Shown on first visit, can be replayed from settings. Uses localStorage to track completion.",
      },
    },
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingTour>;

export const Default: Story = {
  args: {
    forceShow: true,
    onComplete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // First step should be visible
    await expect(
      canvas.getByText("スワイプで月を切り替え"),
    ).toBeInTheDocument();
    // Progress dots and navigation should exist
    await expect(canvas.getByText("スキップ")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /次へ/ }),
    ).toBeInTheDocument();
  },
};

export const NavigateSteps: Story = {
  args: {
    forceShow: true,
    onComplete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Navigate to next step
    const nextButton = canvas.getByRole("button", { name: /次へ/ });
    await userEvent.click(nextButton);
    await expect(canvas.getByText("引っ張って更新")).toBeInTheDocument();

    // Navigate back
    const backButton = canvas.getByRole("button", { name: /戻る/ });
    await userEvent.click(backButton);
    await expect(
      canvas.getByText("スワイプで月を切り替え"),
    ).toBeInTheDocument();
  },
};

export const CompleteAllSteps: Story = {
  args: {
    forceShow: true,
    onComplete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Click through all 6 steps
    for (let i = 0; i < 5; i++) {
      const nextButton = canvas.getByRole("button", { name: /次へ/ });
      await userEvent.click(nextButton);
    }
    // Last step should show "はじめる" button
    const startButton = canvas.getByRole("button", { name: /はじめる/ });
    await expect(startButton).toBeInTheDocument();
    await userEvent.click(startButton);
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};
