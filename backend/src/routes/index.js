import { Router } from "express";

import blockchainRoutes from "./blockchainRoutes.js";
import evaluatorRoutes from "./evaluatorRoutes.js";
import healthRoutes from "./healthRoutes.js";
import ragRoutes from "./ragRoutes.js";
import reportRoutes from "./reportRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/rag", ragRoutes);
router.use("/blockchain", blockchainRoutes);
router.use("/evaluator", evaluatorRoutes);
router.use("/reports", reportRoutes);
router.use("/regulations", ragRoutes); // Alias for frontend compatibility

export default router;
