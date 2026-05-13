import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transactionsRouter from "./transactions";
import categoriesRouter from "./categories";
import summaryRouter from "./summary";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(summaryRouter);
router.use(transactionsRouter);
router.use(categoriesRouter);

export default router;
