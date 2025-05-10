import express from "express";
import { createVehicle, getVehicles } from "../controllers/master.controller.js"; 
const router = express.Router();

router.post("/vehicle", createVehicle);
router.get("/vehicle", getVehicles); // GET all active vehicles


export default router;
