import { describe, expect, it } from "vitest";
import { extractInquiryId } from "./route";

describe("extractInquiryId", () => {
  it("should extract UUID from reply+{id}@domain format", () => {
    const result = extractInquiryId(
      "reply+550e8400-e29b-41d4-a716-446655440000@asset-lens.com",
    );
    expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should handle uppercase UUID", () => {
    const result = extractInquiryId(
      "reply+550E8400-E29B-41D4-A716-446655440000@asset-lens.com",
    );
    expect(result).toBe("550E8400-E29B-41D4-A716-446655440000");
  });

  it("should return null for regular email addresses", () => {
    expect(extractInquiryId("user@example.com")).toBeNull();
  });

  it("should return null for reply+ without valid UUID", () => {
    expect(extractInquiryId("reply+not-a-uuid@asset-lens.com")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(extractInquiryId("")).toBeNull();
  });

  it("should handle subdomain addresses", () => {
    const result = extractInquiryId(
      "reply+550e8400-e29b-41d4-a716-446655440000@reply.asset-lens.com",
    );
    expect(result).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
