import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Network,
  Plus,
  Settings,
} from "lucide-react";

/**
 * BottomNav depends on useSession and usePathname which are hard to mock
 * in Storybook. This is a visual-only static replica for design review.
 */
function BottomNavPreview({ activeIndex = 0 }: { activeIndex?: number }) {
  const items = [
    { label: "ホーム", icon: LayoutDashboard },
    { label: "取引", icon: ArrowLeftRight },
    { label: "分析", icon: Network },
    { label: "設定", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="flex items-center justify-around h-16 px-2">
        {items.slice(0, 2).map((item, i) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 text-[10px] ${
              activeIndex === i
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg"
          aria-label="取引を記録"
        >
          <Plus className="h-6 w-6" />
        </button>

        {items.slice(2).map((item, i) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 text-[10px] ${
              activeIndex === i + 2
                ? "text-primary font-medium"
                : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof BottomNavPreview> = {
  title: "Layouts/BottomNav",
  component: BottomNavPreview,
  parameters: {
    docs: {
      description: {
        component:
          "Mobile bottom navigation bar with Dashboard, Transaction, Insights, and Settings links. Shows active state based on current route.",
      },
    },
    viewport: { defaultViewport: "mobile1" },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <p className="text-muted-foreground">
            Scroll down to see the bottom navigation bar.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomNavPreview>;

export const DashboardActive: Story = {
  args: { activeIndex: 0 },
};

export const TransactionActive: Story = {
  args: { activeIndex: 1 },
};

export const InsightsActive: Story = {
  args: { activeIndex: 2 },
};

export const SettingsActive: Story = {
  args: { activeIndex: 3 },
};
