import express from 'express';
import { createPlantType, deletePlantType, getPlantTypeById, getPlantTypes, updatePlantType } from '../controllers/plantType.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/',protect, getPlantTypes);
router.get('/:id',protect, getPlantTypeById);
router.post('/',protect, createPlantType);
router.put('/:id',protect, updatePlantType);
router.delete('/:id',protect, deletePlantType);

export default router;
