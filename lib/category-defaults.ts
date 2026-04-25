/**
 * Default icon and color mappings for categories.
 *
 * When a category does not have a custom icon/color,
 * these defaults are used based on the category slug.
 */

/** Map of category slug to Lucide icon name */
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  food: "utensils",
  groceries: "shopping-cart",
  dining: "utensils-crossed",
  transport: "car",
  housing: "home",
  rent: "home",
  utilities: "zap",
  entertainment: "gamepad-2",
  shopping: "shopping-bag",
  health: "heart-pulse",
  medical: "stethoscope",
  education: "graduation-cap",
  subscription: "credit-card",
  insurance: "shield",
  savings: "piggy-bank",
  salary: "wallet",
  income: "trending-up",
  investment: "chart-line",
  gift: "gift",
  travel: "plane",
  clothing: "shirt",
  beauty: "sparkles",
  pet: "paw-print",
  communication: "smartphone",
  other: "circle",
};

/** Curated color palette for categories */
export const CATEGORY_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#78716c", // Stone
] as const;

/** Map of category slug to default color */
export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316",
  groceries: "#84cc16",
  dining: "#ef4444",
  transport: "#3b82f6",
  housing: "#6366f1",
  rent: "#6366f1",
  utilities: "#f59e0b",
  entertainment: "#a855f7",
  shopping: "#ec4899",
  health: "#22c55e",
  medical: "#14b8a6",
  education: "#06b6d4",
  subscription: "#8b5cf6",
  insurance: "#78716c",
  savings: "#22c55e",
  salary: "#3b82f6",
  income: "#22c55e",
  investment: "#6366f1",
  gift: "#ec4899",
  travel: "#06b6d4",
  clothing: "#a855f7",
  beauty: "#ec4899",
  pet: "#f97316",
  communication: "#3b82f6",
  other: "#78716c",
};

/**
 * Get the icon name for a category.
 * Falls back to default based on slug, then to "circle".
 */
export function getCategoryIcon(
  icon: string | null | undefined,
  slug: string,
): string {
  return icon || DEFAULT_CATEGORY_ICONS[slug] || "circle";
}

/**
 * Get the color for a category.
 * Falls back to default based on slug, then assigns from palette by index.
 */
export function getCategoryColor(
  color: string | null | undefined,
  slug: string,
  index = 0,
): string {
  return (
    color ||
    DEFAULT_CATEGORY_COLORS[slug] ||
    CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  );
}
