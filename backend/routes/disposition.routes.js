import express from "express";
import {
  getActiveDispositions,
  startCall,
  endCall,
  getCallHistory,
} from "../controllers/dispositionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ===============================
   DISPOSITIONS (AGENT)
=============================== */

// Get active dispositions for agent UI
router.get("/dispositions", protect, getActiveDispositions);

/* ===============================
   CALL FLOW
=============================== */

// Start call
router.post("/calls/start", protect, startCall);


// End call + disposition
router.post("/calls/end", protect, endCall);
router.get("/calls/history/:taskId", protect, getCallHistory);


export default router;
