import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), // セント単位や円単位など、整数管理推奨
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  isExpense: boolean("is_expense").default(true).notNull(), // true=支出, false=収入
  category: text("category").notNull(), // 初期は単純なテキスト、将来的に別テーブル化も検討
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
