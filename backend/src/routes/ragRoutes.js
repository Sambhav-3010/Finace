import { Router } from "express";

import { askGeneralQuery, searchRegulations } from "../controllers/ragController.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { validateRagQueryRequest } from "../validators/ragValidators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/query", requireApiKey, validateRequest(validateRagQueryRequest), asyncHandler(askGeneralQuery));
router.get("/search", requireApiKey, asyncHandler(searchRegulations));

export default router;
