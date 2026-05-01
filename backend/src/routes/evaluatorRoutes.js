import { Router } from "express";

import {
  evaluateComplianceResponse,
  getReports,
  getReportById,
  submitReview,
} from "../controllers/evaluatorController.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateEvaluateRequest } from "../validators/evaluatorValidators.js";

const router = Router();

router.post(
  "/score",
  requireApiKey,
  validateRequest(validateEvaluateRequest),
  asyncHandler(evaluateComplianceResponse)
);

router.get("/reports", requireApiKey, asyncHandler(getReports));
router.get("/reports/:id", requireApiKey, asyncHandler(getReportById));
router.post("/reports/:id/review", requireApiKey, asyncHandler(submitReview));

export default router;
