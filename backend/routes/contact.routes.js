import express from "express";
import {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  searchByMobile,
} from "../controllers/contactController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createContact);
router.get("/", protect, getContacts);
router.get("/:id", protect, getContact);
router.put("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);
router.get("/search/mobile", searchByMobile);
export default router;
