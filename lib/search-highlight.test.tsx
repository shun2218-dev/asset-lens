import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HighlightMatch } from "./search-highlight";

function render(text: string, query: string | undefined): string {
  return renderToString(HighlightMatch({ text, query }) as ReactElement);
}

describe("HighlightMatch", () => {
  it("should return text as-is when no query", () => {
    const html = render("Hello World", undefined);
    expect(html).toBe("Hello World");
  });

  it("should return text as-is when query is empty", () => {
    const html = render("Hello World", "");
    expect(html).toBe("Hello World");
  });

  it("should highlight matching text", () => {
    const html = render("Hello World", "World");
    expect(html).toContain("<mark");
    expect(html).toContain("World</mark>");
    expect(html).toContain("Hello");
  });

  it("should be case-insensitive", () => {
    const html = render("Hello World", "world");
    expect(html).toContain("<mark");
    expect(html).toContain("World</mark>");
  });

  it("should highlight multiple occurrences", () => {
    const html = render("foo bar foo", "foo");
    const markCount = (html.match(/<mark/g) || []).length;
    expect(markCount).toBe(2);
  });

  it("should handle special regex characters in query", () => {
    const html = render("price is $100", "$100");
    expect(html).toContain("<mark");
    expect(html).toContain("$100</mark>");
  });

  it("should handle Japanese text", () => {
    const html = render("コンビニでお弁当", "弁当");
    expect(html).toContain("<mark");
    expect(html).toContain("弁当</mark>");
  });
});
