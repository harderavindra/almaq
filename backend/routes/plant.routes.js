import express from "express";
import PlantType from "../models/plant.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
    console.log(req.body);
  const plantTypes = await PlantType.create(req.body);
  res.status(201).json(plantTypes);
});

router.get("/", async (req, res) => {
  const plantTypes = await PlantType.find();
  res.json(plantTypes);
});

export default router; 
