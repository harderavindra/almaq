import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getAgentTasks, getAgentTaskBatches } from "../controllers/agentController.js";

const router = express.Router();

// Agent dashboard tasks
router.get("/task-batches", protect, getAgentTaskBatches);
router.get("/task-batches/:batchId", protect, getAgentTasks);

export default router;
