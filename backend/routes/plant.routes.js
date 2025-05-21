import express from 'express';
import { createPlantType, deletePlantType, getPlantTypeById, getPlantTypes, updatePlantType } from '../controllers/plantType.controller.js';

const router = express.Router();


router.get('/', getPlantTypes);
router.get('/:id', getPlantTypeById);
router.post('/', createPlantType);
router.put('/:id', updatePlantType);
router.delete('/:id', deletePlantType);

export default router;
