// routes/chalaanRoutes.js

import express from "express";
import { createChallan, deleteChallan, getAllChallans, getChallanById } from "../controllers/challan.controller.js"; // Adjust the import path as needed

const router = express.Router();

router.post("/create", createChallan);
router.get("/", getAllChallans);
router.get("/:id", getChallanById); // Assuming you have a getChallanById function
// router.degetlete("/:id", deleteChallan);
router.delete("/:id", deleteChallan);

export default router;
