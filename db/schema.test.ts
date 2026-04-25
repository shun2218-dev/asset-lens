/**
 * Schema validation tests — ensures schema.ts stays in sync with migration snapshots.
 *
 * Compares Drizzle schema table definitions against the latest migration snapshot
 * to catch drift (e.g., column added to schema but migration not generated).
 */
import fs from "node:fs";
import path from "node:path";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import * as schema from "./schema";

// ─── Helpers ─────────────────────────────────────────────────────────

function getLatestSnapshot(): Record<string, unknown> {
  const journalPath = path.resolve("drizzle/meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
  const entries = journal.entries as { idx: number; tag: string }[];
  const latest = entries[entries.length - 1];
  const idx = String(latest.idx).padStart(4, "0");
  const snapshotPath = path.resolve(`drizzle/meta/${idx}_snapshot.json`);
  return JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
}

type SnapshotColumn = {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
  default?: string;
};

type SnapshotTable = {
  name: string;
  columns: Record<string, SnapshotColumn>;
  indexes: Record<string, { columns: { expression: string }[] }>;
};

/** All pgTable exports from schema.ts (filter out relations, types, etc.) */
function getSchemaTableEntries() {
  const tables: { key: string; table: ReturnType<typeof getTableConfig> }[] =
    [];

  for (const [key, value] of Object.entries(schema)) {
    if (
      value &&
      typeof value === "object" &&
      Symbol.for("drizzle:IsDrizzleTable") in value
    ) {
      tables.push({ key, table: getTableConfig(value as never) });
    }
  }

  return tables;
}

// ─── Tests ───────────────────────────────────────────────────────────

describe("Schema ↔ Migration Snapshot Validation", () => {
  const snapshot = getLatestSnapshot();
  const snapshotTables = snapshot.tables as Record<string, SnapshotTable>;
  const schemaTables = getSchemaTableEntries();

  it("should have all schema tables present in the snapshot", () => {
    const schemaTableNames = schemaTables.map((t) => t.table.name).sort();
    const snapshotTableNames = Object.values(snapshotTables)
      .map((t) => t.name)
      .sort();

    for (const name of schemaTableNames) {
      expect(
        snapshotTableNames,
        `Table "${name}" exists in schema.ts but not in migration snapshot. Run \`npx drizzle-kit generate\` to create a migration.`,
      ).toContain(name);
    }
  });

  it("should not have orphan tables in snapshot that are missing from schema", () => {
    const schemaTableNames = new Set(schemaTables.map((t) => t.table.name));
    const snapshotTableNames = Object.values(snapshotTables).map((t) => t.name);

    for (const name of snapshotTableNames) {
      expect(
        schemaTableNames.has(name),
        `Table "${name}" exists in migration snapshot but not in schema.ts. It may have been removed without generating a migration.`,
      ).toBe(true);
    }
  });

  for (const { key, table } of getSchemaTableEntries()) {
    describe(`Table: ${table.name} (export: ${key})`, () => {
      const snapshotTable = snapshotTables[`public.${table.name}`];

      it("should exist in migration snapshot", () => {
        expect(
          snapshotTable,
          `Table "${table.name}" not found in snapshot`,
        ).toBeDefined();
      });

      if (!snapshotTable) return;

      it("should have matching columns", () => {
        const schemaColNames = table.columns.map((c) => c.name).sort();
        const snapshotColNames = Object.keys(snapshotTable.columns).sort();

        const missingInSnapshot = schemaColNames.filter(
          (n) => !snapshotColNames.includes(n),
        );
        const missingInSchema = snapshotColNames.filter(
          (n) => !schemaColNames.includes(n),
        );

        expect(
          missingInSnapshot,
          `Columns in schema.ts but missing in snapshot (need migration): ${missingInSnapshot.join(", ")}`,
        ).toEqual([]);
        expect(
          missingInSchema,
          `Columns in snapshot but missing in schema.ts (may be stale): ${missingInSchema.join(", ")}`,
        ).toEqual([]);
      });

      for (const col of table.columns) {
        const snapshotCol = snapshotTable.columns[col.name];
        if (!snapshotCol) continue;

        describe(`Column: ${col.name}`, () => {
          it("should have matching notNull constraint", () => {
            expect(
              col.notNull,
              `"${table.name}.${col.name}" notNull mismatch — schema: ${col.notNull}, snapshot: ${snapshotCol.notNull}`,
            ).toBe(snapshotCol.notNull);
          });

          it("should have matching primary key flag", () => {
            expect(
              col.primary,
              `"${table.name}.${col.name}" primaryKey mismatch — schema: ${col.primary}, snapshot: ${snapshotCol.primaryKey}`,
            ).toBe(snapshotCol.primaryKey);
          });
        });
      }

      it("should have matching index count", () => {
        const schemaIndexCount = table.indexes.length;
        const snapshotIndexCount = Object.keys(
          snapshotTable.indexes ?? {},
        ).length;

        expect(
          schemaIndexCount,
          `"${table.name}" index count mismatch — schema: ${schemaIndexCount}, snapshot: ${snapshotIndexCount}`,
        ).toBe(snapshotIndexCount);
      });
    });
  }
});
