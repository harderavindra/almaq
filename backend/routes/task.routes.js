import express from "express";
import {

    getMyTasks,
    getTasks,
    updateTaskStatus
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", protect,getTasks);   // ← this must exist
// router.get("/my",protect, getMyTasks);
// router.put("/:id/status", updateTaskStatus);



export default router;

