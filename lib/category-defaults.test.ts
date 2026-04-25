import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLORS,
  getCategoryColor,
  getCategoryIcon,
} from "./category-defaults";

describe("getCategoryIcon", () => {
  it("should return custom icon when provided", () => {
    expect(getCategoryIcon("star", "food")).toBe("star");
  });

  it("should return default icon for known slug", () => {
    expect(getCategoryIcon(null, "food")).toBe("utensils");
    expect(getCategoryIcon(undefined, "transport")).toBe("car");
  });

  it("should return circle for unknown slug", () => {
    expect(getCategoryIcon(null, "unknown-category")).toBe("circle");
  });
});

describe("getCategoryColor", () => {
  it("should return custom color when provided", () => {
    expect(getCategoryColor("#ff0000", "food")).toBe("#ff0000");
  });

  it("should return default color for known slug", () => {
    expect(getCategoryColor(null, "food")).toBe("#f97316");
    expect(getCategoryColor(undefined, "transport")).toBe("#3b82f6");
  });

  it("should return palette color for unknown slug", () => {
    const result = getCategoryColor(null, "unknown", 0);
    expect(result).toBe(CATEGORY_COLORS[0]);
  });

  it("should cycle through palette for index", () => {
    const result = getCategoryColor(null, "unknown", CATEGORY_COLORS.length);
    expect(result).toBe(CATEGORY_COLORS[0]);
  });
});
