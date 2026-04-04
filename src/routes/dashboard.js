import { Router } from "express";
import {
  getSummaryController,
  getCategoryTotalsController,
  getRecentActivityController,
  getMonthlyTrendsController
} from "../controllers/dashboardController.js";
import { auth } from "../middlewares/auth.js";
import { allow } from "../middlewares/rbac.js";

const router = Router();

router.get("/summary", auth, allow("ANALYST", "ADMIN"), getSummaryController);
router.get("/categories", auth, allow("ANALYST", "ADMIN"), getCategoryTotalsController);
router.get("/recent", auth, allow("ANALYST", "ADMIN"), getRecentActivityController);
router.get("/trends", auth, allow("ANALYST", "ADMIN"), getMonthlyTrendsController);

export default router;