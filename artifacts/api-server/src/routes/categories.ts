import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { CreateCategoryBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  return res.json(rows);
});

router.post("/categories", requireAdmin, async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const [inserted] = await db
    .insert(categoriesTable)
    .values(parsed.data)
    .returning();

  return res.status(201).json(inserted);
});

export default router;
