import { Router } from "express";
import { db, transactionsTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const rows = await db
    .select({
      type: transactionsTable.type,
      total: sql<string>`COALESCE(SUM(${transactionsTable.amount}), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(transactionsTable)
    .groupBy(transactionsTable.type);

  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;

  for (const row of rows) {
    if (row.type === "income") totalIncome = parseFloat(row.total);
    if (row.type === "expense") totalExpense = parseFloat(row.total);
    transactionCount += row.count;
  }

  return res.json({
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    transactionCount,
  });
});

router.get("/summary/by-category", async (_req, res) => {
  const rows = await db
    .select({
      categoryId: transactionsTable.categoryId,
      categoryName: sql<string>`COALESCE(${categoriesTable.name}, 'Tidak Berkategori')`,
      color: sql<string>`COALESCE(${categoriesTable.color}, '#94a3b8')`,
      total: sql<string>`SUM(${transactionsTable.amount})`,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
    .where(eq(transactionsTable.type, "expense"))
    .groupBy(transactionsTable.categoryId, categoriesTable.name, categoriesTable.color);

  const totalExpense = rows.reduce((acc, r) => acc + parseFloat(r.total), 0);

  return res.json(
    rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      color: r.color,
      total: parseFloat(r.total),
      percentage: totalExpense > 0 ? (parseFloat(r.total) / totalExpense) * 100 : 0,
    }))
  );
});

router.get("/summary/monthly", async (_req, res) => {
  const rows = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${transactionsTable.date}::date)::int`,
      year: sql<number>`EXTRACT(YEAR FROM ${transactionsTable.date}::date)::int`,
      type: transactionsTable.type,
      total: sql<string>`SUM(${transactionsTable.amount})`,
    })
    .from(transactionsTable)
    .where(
      sql`${transactionsTable.date}::date >= NOW() - INTERVAL '6 months'`
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date)`,
      sql`EXTRACT(MONTH FROM ${transactionsTable.date}::date)`,
      transactionsTable.type
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date)`,
      sql`EXTRACT(MONTH FROM ${transactionsTable.date}::date)`
    );

  // Merge income and expense per month
  const map = new Map<string, { month: number; year: number; income: number; expense: number }>();
  for (const row of rows) {
    const key = `${row.year}-${row.month}`;
    if (!map.has(key)) map.set(key, { month: row.month, year: row.year, income: 0, expense: 0 });
    const entry = map.get(key)!;
    if (row.type === "income") entry.income = parseFloat(row.total);
    if (row.type === "expense") entry.expense = parseFloat(row.total);
  }

  return res.json(Array.from(map.values()));
});

export default router;
