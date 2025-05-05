import express from "express";
import Plant from "../models/plant.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
    console.log(req.body);
  const plant = await Plant.create(req.body);
  res.status(201).json(plant);
});

router.get("/", async (req, res) => {
  const plants = await Plant.find();
  res.json(plants);
});

export default router; 
