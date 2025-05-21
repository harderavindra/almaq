import express from 'express';
import { createChallan, deleteChallan, getAllChallans, getChallanById, getDeliveredChallanItems, updateChallanItemDeliveryStatus } from '../controllers/challan.controller.js';

const router = express.Router();
router.get('/fully-delivered', getDeliveredChallanItems);
router.post('/', createChallan);
router.get('/:id', getChallanById);
router.get('/', getAllChallans);
router.delete('/:id', deleteChallan);
router.patch('/:challanId/items/:itemId/deliver', updateChallanItemDeliveryStatus);

export default router;
