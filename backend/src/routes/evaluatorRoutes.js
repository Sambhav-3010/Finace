import { Router } from "express";

import {
  evaluateComplianceResponse,
  getReports,
  getReportById,
  submitReview,
} from "../controllers/evaluatorController.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { requireEvaluatorAuth, requireAuth } from "../middlewares/requireEvaluatorAuth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateEvaluateRequest } from "../validators/evaluatorValidators.js";

const router = Router();

// Automated machine-to-machine scoring
router.post(
  "/score",
  requireApiKey,
  validateRequest(validateEvaluateRequest),
  asyncHandler(evaluateComplianceResponse)
);

// VIEWING Reports - Open to both Company (user) and Evaluator roles
router.get("/reports", requireAuth, asyncHandler(getReports));
router.get("/reports/:id", requireAuth, asyncHandler(getReportById));

// REVIEWING Reports - Specifically restricted to Evaluator role
router.post("/reports/:id/review", requireEvaluatorAuth, asyncHandler(submitReview));

export default router;
