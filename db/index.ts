import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { PerformanceLogger } from "./logger";
import * as schema from "./schema";

export const db = drizzle(sql, {
  schema,
  logger: new PerformanceLogger(),
});
