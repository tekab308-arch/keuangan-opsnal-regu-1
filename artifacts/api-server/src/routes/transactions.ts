import { Router } from "express";
import { db, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  CreateTransactionBody,
  ListTransactionsQueryParams,
  GetTransactionParams,
  DeleteTransactionParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/transactions", async (req, res) => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { type, categoryId, limit } = parsed.data;
  const conditions = [];

  if (type) conditions.push(eq(transactionsTable.type, type));
  if (categoryId != null) conditions.push(eq(transactionsTable.categoryId, categoryId));

  const rows = await db
    .select({
      id: transactionsTable.id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      categoryId: transactionsTable.categoryId,
      categoryName: categoriesTable.name,
      createdAt: transactionsTable.createdAt,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.createdAt))
    .limit(limit ?? 100);

  return res.json(
    rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
    }))
  );
});

router.post("/transactions", requireAdmin, async (req, res) => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { amount, type, description, date, categoryId } = parsed.data;
  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : String(date);
  const [inserted] = await db
    .insert(transactionsTable)
    .values({ amount: String(amount), type, description, date: dateStr, categoryId: categoryId ?? null })
    .returning();

  const rows = await db
    .select({
      id: transactionsTable.id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      categoryId: transactionsTable.categoryId,
      categoryName: categoriesTable.name,
      createdAt: transactionsTable.createdAt,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(eq(transactionsTable.id, inserted.id));

  const row = rows[0];
  return res.status(201).json({ ...row, amount: parseFloat(row.amount) });
});

router.get("/transactions/:id", async (req, res) => {
  const parsed = GetTransactionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const rows = await db
    .select({
      id: transactionsTable.id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      categoryId: transactionsTable.categoryId,
      categoryName: categoriesTable.name,
      createdAt: transactionsTable.createdAt,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(eq(transactionsTable.id, parsed.data.id));

  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const row = rows[0];
  return res.json({ ...row, amount: parseFloat(row.amount) });
});

router.delete("/transactions/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteTransactionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(transactionsTable).where(eq(transactionsTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
