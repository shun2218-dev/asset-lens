/**
 * Generate DBML and Mermaid ER diagram from Drizzle schema.
 *
 * Usage: npx tsx scripts/generate-dbml.ts
 *
 * Outputs:
 *   - docs/schema.dbml  — import into dbdiagram.io for interactive view
 *   - docs/er-diagram.md — Mermaid ER diagram viewable on GitHub
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pgGenerate } from "drizzle-dbml-generator";
import * as schema from "../db/schema";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const DOCS_DIR = resolve(ROOT, "docs");
const DBML_PATH = resolve(DOCS_DIR, "schema.dbml");
const MERMAID_PATH = resolve(DOCS_DIR, "er-diagram.md");

// Ensure docs/ exists
if (!existsSync(DOCS_DIR)) {
  mkdirSync(DOCS_DIR, { recursive: true });
}

// --- 1. Generate DBML ---
pgGenerate({ schema, out: DBML_PATH, relational: true });
console.log(`✅ DBML generated: ${DBML_PATH}`);

// --- 2. Parse DBML and generate Mermaid ER diagram ---
const dbml = readFileSync(DBML_PATH, "utf-8");

type TableDef = {
  name: string;
  columns: { name: string; type: string; pk: boolean; nullable: boolean }[];
};

type Ref = {
  from: string;
  fromCol: string;
  to: string;
  toCol: string;
  type: string; // ">", "<", "-"
};

function parseDbml(content: string): { tables: TableDef[]; refs: Ref[] } {
  const tables: TableDef[] = [];
  const refs: Ref[] = [];

  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Detect table start
    const tableMatch = line.match(/^[Tt]able\s+"?(\w+)"?\s*\{/);
    if (tableMatch) {
      const name = tableMatch[1];
      const columns: TableDef["columns"] = [];
      i++;
      let depth = 1;

      while (i < lines.length && depth > 0) {
        const tl = lines[i].trim();

        if (tl.includes("{")) depth++;
        if (tl.includes("}")) depth--;

        if (
          depth === 1 &&
          !tl.startsWith("indexes") &&
          tl !== "}" &&
          tl !== ""
        ) {
          const colMatch = tl.match(/^"?(\w+)"?\s+(\S+)(?:\s+\[([^\]]*)\])?/);
          if (colMatch) {
            const constraints = colMatch[3] || "";
            columns.push({
              name: colMatch[1],
              type: colMatch[2].replace(/"/g, ""),
              pk: constraints.includes("pk"),
              nullable:
                !constraints.includes("not null") &&
                !constraints.includes("pk"),
            });
          }
        }
        i++;
      }

      if (columns.length > 0) {
        tables.push({ name, columns });
      }
      continue;
    }

    // Detect ref
    const refMatch = line.match(
      /^[Rr]ef:\s*"?(\w+)"?\."?(\w+)"?\s*([<>-])\s*"?(\w+)"?\."?(\w+)"?/,
    );
    if (refMatch) {
      refs.push({
        from: refMatch[1],
        fromCol: refMatch[2],
        to: refMatch[4],
        toCol: refMatch[5],
        type: refMatch[3],
      });
    }

    i++;
  }

  return { tables, refs };
}

function toMermaid(tables: TableDef[], refs: Ref[]): string {
  const lines: string[] = ["erDiagram"];

  // Relationships
  for (const ref of refs) {
    let rel: string;
    if (ref.type === ">") {
      rel = "}o--||"; // many-to-one
    } else if (ref.type === "<") {
      rel = "||--o{"; // one-to-many
    } else {
      rel = "||--||"; // one-to-one
    }
    lines.push(`    ${ref.from} ${rel} ${ref.to} : "${ref.fromCol}"`);
  }

  lines.push("");

  // Table definitions
  for (const table of tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns) {
      const pkTag = col.pk ? "PK" : "";
      // Detect FK from refs
      const fkRef = refs.find(
        (r) =>
          (r.from === table.name && r.fromCol === col.name) ||
          (r.to === table.name && r.toCol === col.name),
      );
      const fkTag = fkRef && !col.pk ? "FK" : "";
      const tag = pkTag || fkTag;
      lines.push(`        ${col.type} ${col.name}${tag ? ` ${tag}` : ""}`);
    }
    lines.push("    }");
  }

  return lines.join("\n");
}

const { tables, refs } = parseDbml(dbml);
const mermaid = toMermaid(tables, refs);

const mermaidDoc = `# Database ER Diagram

> Auto-generated from \`db/schema.ts\` by \`scripts/generate-dbml.ts\`.
> **Do not edit manually** — changes will be overwritten.
>
> For an interactive view, import [\`docs/schema.dbml\`](./schema.dbml) into [dbdiagram.io](https://dbdiagram.io/d).

\`\`\`mermaid
${mermaid}
\`\`\`

---

*Last updated: ${new Date().toISOString().split("T")[0]}*
`;

writeFileSync(MERMAID_PATH, mermaidDoc);
console.log(`✅ Mermaid ER diagram generated: ${MERMAID_PATH}`);
console.log(`📊 ${tables.length} tables, ${refs.length} relationships`);
