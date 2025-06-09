import express from 'express';
import { createChallan, deleteChallan, getAllChallans, getChallanById, getDeliveredChallanItems, updateChallanItemDeliveryStatus } from '../controllers/challan.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/fully-delivered',protect, getDeliveredChallanItems);
router.post('/',protect, createChallan);
router.get('/:id',protect, getChallanById);
router.get('/',protect, getAllChallans);
router.delete('/:id',protect, deleteChallan);
router.patch('/:challanId/items/:itemId/deliver',protect, updateChallanItemDeliveryStatus);

export default router;
