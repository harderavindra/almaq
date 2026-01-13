import express from "express";
import {
  getDispositions,
  createDisposition,
  updateDisposition,
  toggleDisposition,
} from "../controllers/adminDispositionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDispositions);
router.post("/", protect, createDisposition);
router.put("/:id", protect, updateDisposition);
router.patch("/:id/toggle", protect, toggleDisposition);

export default router;
