import express from "express";
import Department from "../models/department.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json(dept);
});

router.get("/", async (req, res) => {
  const depts = await Department.find();
  res.json(depts);
});

export default router;