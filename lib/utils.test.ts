import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should handle conditional classes", () => {
    expect(cn("bg-red-500", true && "text-white", false && "hidden")).toBe("bg-red-500 text-white");
  });

  it("should merge tailwind classes properly", () => {
    // twMerge handles conflict resolution (e.g. p-4 overrides p-2)
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("px-2 py-2", "p-4")).toBe("p-4");
  });
  
  it("should handle arrays and objects if supported by clsx", () => {
    expect(cn(["a", "b"])).toBe("a b");
    expect(cn({ "c": true, "d": false })).toBe("c");
  });
});
