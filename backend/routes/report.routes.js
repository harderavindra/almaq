import express from "express";
import { batchOverview, agentPerformance, callOutcomeAnalytics, dispositionAnalysis } from "../controllers/reports/batchOverviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get( "/batches/:batchId/overview",  protect,  batchOverview);
router.get( "/batches/:batchId/disposition-analysis",  protect,  dispositionAnalysis);
router.get( "/batches/:batchId/agent-performance",  protect,  agentPerformance);
router.get( "/batches/:batchId/call-outcome-analytics",  protect,  callOutcomeAnalytics); 


export default router;
