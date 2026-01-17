import express from "express";
import { batchOverview, agentPerformance, callOutcomeAnalytics, dispositionContactAnalysis, dispositionAttemptsAnalysis, dispositionCompletedAnalysis } from "../controllers/reports/batchOverviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get( "/batches/:batchId/overview",  protect,  batchOverview);
router.get( "/batches/:batchId/disposition-contact-analysis",  protect,  dispositionContactAnalysis);
router.get( "/batches/:batchId/disposition-attempts-analysis",  protect,  dispositionAttemptsAnalysis);
router.get( "/batches/:batchId/disposition-completed-analysis",  protect,  dispositionCompletedAnalysis);

router.get( "/batches/:batchId/agent-performance",  protect,  agentPerformance);
router.get( "/batches/:batchId/call-outcome-analytics",  protect,  callOutcomeAnalytics); 


export default router;
