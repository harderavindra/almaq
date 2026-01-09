import express from "express";
import {
  createVisitor,
  getVisitors,
  getVisitorById,
  updateVisitor,
  updateVisitorStatus,
  checkoutVisitor,
  convertVisitorToContact,
  getVisitorTimeline,
  getVisitorTimelineDays,
  getVisitorsByDay,
  getVisitorsByWeek,
  
} from "../controllers/visitorController.js";

// Optional: add auth middleware
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------------------
// Visitor Routes
// ------------------------------

// Create new visitor
router.post("/", /* protect, */ createVisitor);

// Get all visitors (with filters + pagination)
router.get("/", /* protect, */ getVisitors);

// Get single visitor
router.get("/timeline", getVisitorTimelineDays);
router.get("/timeline/day/:date", getVisitorsByDay);
router.get("/timeline/week", getVisitorsByWeek);
router.put("/:id/checkout", checkoutVisitor);

router.get("/timeline", getVisitorTimeline);
router.get("/:id", /* protect, */ getVisitorById);

// Update visitor
router.put("/:id", /* protect, */ updateVisitor);

// Update status (waiting → in-progress → completed → cancelled)
router.patch("/:id/status", /* protect, */ updateVisitorStatus);

// Checkout visitor (sets outTime + completed)
router.patch("/:id/checkout", /* protect, */ checkoutVisitor);

// Convert visitor → contact
router.post("/:id/convert", /* protect, */ convertVisitorToContact);


export default router;
