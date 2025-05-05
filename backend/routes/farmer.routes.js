import express from "express";
import Farmer from "../models/farmer.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const farmer = await Farmer.create(req.body);
  res.status(201).json(farmer);
});

router.get("/", async (req, res) => {
  const farmers = await Farmer.find();
  res.json(farmers);
});

export default router;
