import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const category = pgTable(
  "category",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type").default("expense").notNull(),
    icon: text("icon"), // Lucide icon name (e.g., "utensils", "car")
    color: text("color"), // Hex color (e.g., "#ef4444")
    userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("category_userId_idx").on(table.userId)],
);

export type SelectCategory = typeof category.$inferSelect;

export const transaction = pgTable(
  "transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // セント単位や円単位など、整数管理推奨
    description: text("description").notNull(),
    storeName: text("store_name"), // 店舗名・サービス名（nullable、後から一括更新可能）
    date: date("date", { mode: "date" }).defaultNow().notNull(),
    isExpense: boolean("is_expense").default(true).notNull(), // true=支出, false=収入
    category: text("category").notNull(), // 初期は単純なテキスト、将来的に別テーブル化も検討
    categoryId: uuid("category_id").references(() => category.id),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("transactions_userId_idx").on(table.userId),
    index("transactions_userId_date_idx").on(table.userId, table.date),
    index("transactions_userId_storeName_idx").on(
      table.userId,
      table.storeName,
    ),
  ],
);

export type SelectTransaction = InferSelectModel<typeof transaction>;

export type InsertTransaction = InferInsertModel<typeof transaction>;

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      precision: 0,
      withTimezone: true,
    }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 0,
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 0,
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 0,
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true }),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);

export const subscription = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // サービス名 (例: Netflix)
    amount: integer("amount").notNull(),
    currency: text("currency").default("JPY").notNull(),
    billingCycle: text("billing_cycle").notNull(), // 'monthly' | 'yearly'
    nextPaymentDate: timestamp("next_payment_date", {
      precision: 0,
      withTimezone: true,
    }).notNull(), // 次回の支払日
    category: text("category").notNull(), // 'subscription' や 'entertainment' など
    status: text("status").default("active").notNull(), // 'active' | 'paused'
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("subscription_userId_idx").on(table.userId)],
);

export type InsertSubscription = InferInsertModel<typeof subscription>;
export type SelectSubscription = InferSelectModel<typeof subscription>;

export const store = pgTable(
  "store",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // 店舗名・サービス名
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("store_userId_idx").on(table.userId)],
);

export type SelectStore = InferSelectModel<typeof store>;
export type InsertStore = InferInsertModel<typeof store>;

export const categoryRelations = relations(category, ({ many }) => ({
  transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  categoryData: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  transactions: many(transaction),
  subscriptions: many(subscription),
  stores: many(store),
  transactionTemplates: many(transactionTemplate),
  dismissedDuplicates: many(dismissedDuplicate),
}));

export const storeRelations = relations(store, ({ one }) => ({
  user: one(user, {
    fields: [store.userId],
    references: [user.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

// Budget: hybrid model
// categoryId = null → overall monthly budget (parent)
// categoryId = uuid → per-category budget (child)
export const budget = pgTable(
  "budget",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "cascade",
    }),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("budget_userId_categoryId_idx").on(table.userId, table.categoryId),
  ],
);

export type SelectBudget = typeof budget.$inferSelect;
export type InsertBudget = typeof budget.$inferInsert;

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [budget.categoryId],
    references: [category.id],
  }),
}));

export const transactionTemplate = pgTable(
  "transaction_template",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: integer("amount").notNull(),
    description: text("description").default(""),
    storeName: text("store_name"),
    category: text("category").notNull(),
    isExpense: boolean("is_expense").default(true).notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("template_userId_idx").on(table.userId)],
);

export type SelectTransactionTemplate = InferSelectModel<
  typeof transactionTemplate
>;
export type InsertTransactionTemplate = InferInsertModel<
  typeof transactionTemplate
>;

export const transactionTemplateRelations = relations(
  transactionTemplate,
  ({ one }) => ({
    user: one(user, {
      fields: [transactionTemplate.userId],
      references: [user.id],
    }),
  }),
);

export const dismissedDuplicate = pgTable(
  "dismissed_duplicate",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    transactionId1: uuid("transaction_id_1")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    transactionId2: uuid("transaction_id_2")
      .notNull()
      .references(() => transaction.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("dismissed_dup_userId_idx").on(table.userId),
    index("dismissed_dup_pair_idx").on(
      table.transactionId1,
      table.transactionId2,
    ),
  ],
);

export type SelectDismissedDuplicate = InferSelectModel<
  typeof dismissedDuplicate
>;
export type InsertDismissedDuplicate = InferInsertModel<
  typeof dismissedDuplicate
>;

export const dismissedDuplicateRelations = relations(
  dismissedDuplicate,
  ({ one }) => ({
    user: one(user, {
      fields: [dismissedDuplicate.userId],
      references: [user.id],
    }),
  }),
);

export const contactInquiry = pgTable(
  "contact_inquiry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    category: text("category").notNull(),
    message: text("message").notNull(),
    status: text("status").default("new").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 0, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("contact_inquiry_status_idx").on(table.status),
    index("contact_inquiry_created_at_idx").on(table.createdAt),
  ],
);

export type SelectContactInquiry = InferSelectModel<typeof contactInquiry>;
export type InsertContactInquiry = InferInsertModel<typeof contactInquiry>;
