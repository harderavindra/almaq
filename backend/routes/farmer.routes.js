import express from "express";
import {
  getLatestFarmers,
  createFarmer,
  getFarmers,
  getFarmerById,
  updateFarmer,
  deleteFarmer,
  bulkUploadFarmers
} from "../controllers/framer.controller.js";
import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get("/latest", protect,getLatestFarmers);
router.post("/", protect,createFarmer);
router.get("/",protect, getFarmers);
router.get("/:id",protect, getFarmerById);
router.put("/:id", protect,updateFarmer);
router.delete("/:id", protect, deleteFarmer);
router.post('/bulk-upload', bulkUploadFarmers);


export default router;
