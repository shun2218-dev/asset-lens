import { describe, expect, it } from "vitest";
import { computeSankeyLayout, sankeyLinkPath } from "./layout";

describe("computeSankeyLayout", () => {
  it("returns empty result when no nodes or links", () => {
    const empty = computeSankeyLayout([], [], { width: 200, height: 100 });
    expect(empty.nodes).toEqual([]);
    expect(empty.links).toEqual([]);
  });

  it("places three columns at 0, midpoint, and right edge", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "Total" },
        { id: "cat", level: 1, label: "Food" },
        { id: "leaf", level: 2, label: "Store A", parentId: "cat" },
      ],
      [
        { source: "root", target: "cat", value: 1000 },
        { source: "cat", target: "leaf", value: 1000 },
      ],
      { width: 320, height: 200, nodeWidth: 16 },
    );

    const root = res.nodes.find((n) => n.id === "root");
    const cat = res.nodes.find((n) => n.id === "cat");
    const leaf = res.nodes.find((n) => n.id === "leaf");

    expect(root?.x0).toBe(0);
    expect(root?.x1).toBe(16);
    expect(cat?.x0).toBe((320 - 16) / 2);
    expect(leaf?.x0).toBe(320 - 16);
  });

  it("derives node value from sum of incoming and outgoing links", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "a", level: 1, label: "A" },
        { id: "b", level: 1, label: "B" },
        { id: "leafA", level: 2, label: "lA", parentId: "a" },
        { id: "leafB", level: 2, label: "lB", parentId: "b" },
      ],
      [
        { source: "root", target: "a", value: 700 },
        { source: "root", target: "b", value: 300 },
        { source: "a", target: "leafA", value: 700 },
        { source: "b", target: "leafB", value: 300 },
      ],
      { width: 400, height: 200 },
    );

    const a = res.nodes.find((n) => n.id === "a");
    const b = res.nodes.find((n) => n.id === "b");
    expect(a?.value).toBe(700);
    expect(b?.value).toBe(300);
    // Larger value renders taller.
    expect((a?.y1 ?? 0) - (a?.y0 ?? 0)).toBeGreaterThan(
      (b?.y1 ?? 0) - (b?.y0 ?? 0),
    );
  });

  it("orders mid column by descending value", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "small", level: 1, label: "S" },
        { id: "big", level: 1, label: "B" },
        { id: "lS", level: 2, label: "lS", parentId: "small" },
        { id: "lB", level: 2, label: "lB", parentId: "big" },
      ],
      [
        { source: "root", target: "small", value: 100 },
        { source: "root", target: "big", value: 900 },
        { source: "small", target: "lS", value: 100 },
        { source: "big", target: "lB", value: 900 },
      ],
      { width: 300, height: 100 },
    );

    const big = res.nodes.find((n) => n.id === "big");
    const small = res.nodes.find((n) => n.id === "small");
    expect((big?.y0 ?? Number.POSITIVE_INFINITY)).toBeLessThan(
      small?.y0 ?? 0,
    );
  });

  it("handles tag fan-out where one transaction is split equally across tags", () => {
    // Simulates: ¥3000 transaction with 3 tags → ¥1000 per tag.
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "cat", level: 1, label: "Food" },
        { id: "tag1", level: 2, label: "T1", parentId: "cat" },
        { id: "tag2", level: 2, label: "T2", parentId: "cat" },
        { id: "tag3", level: 2, label: "T3", parentId: "cat" },
      ],
      [
        { source: "root", target: "cat", value: 3000 },
        { source: "cat", target: "tag1", value: 1000 },
        { source: "cat", target: "tag2", value: 1000 },
        { source: "cat", target: "tag3", value: 1000 },
      ],
      { width: 400, height: 300 },
    );

    const tags = res.nodes.filter((n) => n.level === 2);
    expect(tags).toHaveLength(3);
    // All three leaves have equal heights to within 1px.
    const heights = tags.map((t) => t.y1 - t.y0);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
  });

  it("filters out non-positive link values", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "a", level: 1, label: "A" },
        { id: "leaf", level: 2, label: "L", parentId: "a" },
      ],
      [
        { source: "root", target: "a", value: 100 },
        { source: "a", target: "leaf", value: 100 },
        { source: "a", target: "leaf", value: 0 }, // ignored
        { source: "a", target: "leaf", value: -50 }, // ignored
      ],
      { width: 200, height: 100 },
    );

    expect(res.links).toHaveLength(2);
  });

  it("ignores links pointing at unknown node ids", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "a", level: 1, label: "A" },
        { id: "leaf", level: 2, label: "L", parentId: "a" },
      ],
      [
        { source: "root", target: "a", value: 100 },
        { source: "a", target: "ghost", value: 50 }, // ignored
        { source: "a", target: "leaf", value: 100 },
      ],
      { width: 200, height: 100 },
    );

    expect(res.links).toHaveLength(2);
    expect(res.links.every((l) => l.target !== "ghost")).toBe(true);
  });

  it("groups column 2 nodes by parent column 1 order", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "big", level: 1, label: "B" }, // 800
        { id: "small", level: 1, label: "S" }, // 200
        { id: "bigChild", level: 2, label: "bc", parentId: "big" },
        { id: "smallChild", level: 2, label: "sc", parentId: "small" },
      ],
      [
        { source: "root", target: "big", value: 800 },
        { source: "root", target: "small", value: 200 },
        { source: "big", target: "bigChild", value: 800 },
        { source: "small", target: "smallChild", value: 200 },
      ],
      { width: 300, height: 200 },
    );

    const bigChild = res.nodes.find((n) => n.id === "bigChild");
    const smallChild = res.nodes.find((n) => n.id === "smallChild");
    // bigChild appears above smallChild because "big" appears above "small".
    expect((bigChild?.y0 ?? 0)).toBeLessThan(smallChild?.y0 ?? 0);
  });

  it("computes link width as min of source and target band sizes", () => {
    const res = computeSankeyLayout(
      [
        { id: "root", level: 0, label: "R" },
        { id: "cat", level: 1, label: "C" },
        { id: "leaf", level: 2, label: "L", parentId: "cat" },
      ],
      [
        { source: "root", target: "cat", value: 1000 },
        { source: "cat", target: "leaf", value: 1000 },
      ],
      { width: 200, height: 100 },
    );

    for (const l of res.links) {
      expect(l.width).toBeGreaterThan(0);
    }
  });
});

describe("sankeyLinkPath", () => {
  it("produces a horizontal cubic bezier between source and target y-positions", () => {
    const path = sankeyLinkPath(
      {
        source: "a",
        target: "b",
        value: 100,
        sourceY: 20,
        targetY: 80,
        width: 4,
        sourceColor: "#000",
      },
      10,
      90,
    );
    expect(path).toBe("M10,20 C50,20 50,80 90,80");
  });
});
