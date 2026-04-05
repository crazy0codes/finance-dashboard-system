import { Router } from "express";
import {
  getSummaryController,
  getCategoryTotalsController,
  getRecentActivityController,
  getMonthlyTrendsController
} from "../controllers/dashboardController.js";
import {
  validateGetCategoryTotals,
  validateGetMonthlyTrends,
  validateGetRecentActivity,
  validateGetSummary
} from "../validations/dashboardValidation.js"
import { auth } from "../middlewares/auth.js";
import { allow } from "../middlewares/rbac.js";

const router = Router();

router.get("/summary", auth, allow("ANALYST", "ADMIN"), validateGetSummary, getSummaryController);
router.get("/categories", auth, allow("ANALYST", "ADMIN"), validateGetCategoryTotals, getCategoryTotalsController);
router.get("/recent", auth, allow("ANALYST", "ADMIN"), validateGetRecentActivity, getRecentActivityController);
router.get("/trends", auth, allow("ANALYST", "ADMIN"), validateGetMonthlyTrends, getMonthlyTrendsController);

export default router;