import express from "express";
import { createVehicle, getVehicles } from "../controllers/master.controller.js"; 
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/vehicle",protect, createVehicle);
router.get("/vehicle",protect, getVehicles); // GET all active vehicles


export default router;
