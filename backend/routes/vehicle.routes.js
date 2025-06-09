import express from 'express';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteOrDeactivateVehicle
} from '../controllers/vehicle.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/',protect, createVehicle);
router.get('/',protect, getVehicles);
router.get('/:id',protect, getVehicleById);
router.put('/:id',protect, updateVehicle);
router.delete('/:id',protect  , deleteOrDeactivateVehicle);
export default router;
