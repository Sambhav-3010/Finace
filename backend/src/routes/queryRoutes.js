import { Router } from "express";

import { askGeneralQuery } from "../controllers/queryController.js";
import { validateAskRequest } from "../middlewares/validateAskRequest.js";

const router = Router();

router.post("/ask", validateAskRequest, askGeneralQuery);

export default router;
