import express from "express";
import {

createTaskBatch,
  deleteTaskBatch,
  getTaskBatchById,
getTaskBatches,
updateTaskBatch,
  
} from "../controllers/taskBatchController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createTaskBatch);
router.get("/", protect, getTaskBatches);
router.get("/:id", protect, getTaskBatchById);
router.delete("/:id", protect, deleteTaskBatch);

router.patch("/:id/status",protect, updateTaskBatch);


export default router;