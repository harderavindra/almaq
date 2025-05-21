import express from 'express';
import { getNextNumber } from '../controllers/utility.controller.js';
const router = express.Router();

router.get('/generate-number', getNextNumber); // ?type=ORD

export default router;