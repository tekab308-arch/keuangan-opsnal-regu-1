import { pgTable, serial, numeric, text, date, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
