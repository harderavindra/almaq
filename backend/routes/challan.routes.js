import express from 'express';
import { addItemsToChallan, createChallan, deleteChallan, getAllChallans, getChallanById, getChallanStatusCounts, getDeliveredChallanItems, updateChallanItemDeliveryStatus, updateChallanStatus } from '../controllers/challan.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/fully-delivered',protect, getDeliveredChallanItems);
router.get('/status-counts',protect, getChallanStatusCounts);
router.post('/',protect, createChallan);
router.patch('/:id/status', updateChallanStatus);
router.get('/:id',protect, getChallanById);
router.get('/',protect, getAllChallans);
router.delete('/:id',protect, deleteChallan);
router.post('/:challanId/items',protect, addItemsToChallan);
router.patch('/:challanId/items/:itemId/deliver',protect, updateChallanItemDeliveryStatus);

export default router;
