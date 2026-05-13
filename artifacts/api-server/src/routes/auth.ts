import { Router } from "express";

const router = Router();

router.get("/auth/me", (req, res) => {
  const role = req.session?.role ?? "user";
  return res.json({ role });
});

router.post("/auth/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: "Admin password not configured" });
  }

  if (password === adminPassword) {
    req.session.role = "admin";
    return res.json({ role: "admin" });
  }

  return res.status(401).json({ error: "Password salah" });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
