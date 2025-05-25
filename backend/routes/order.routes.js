import express from 'express';
import { createOrder, deleteOrder, getOrders, getOrderStatusCounts, getOrdersWithItems, getOrderWithItemsById,updateOrderStatus } from '../controllers/order.controller.js';
import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.get('/status-counts', getOrderStatusCounts);
router.post('/', protect, createOrder);
router.get('/', getOrders);
router.get('/with-items', protect, getOrdersWithItems);
router.put('/:id/status', protect, updateOrderStatus);
router.get('/:id', protect, getOrderWithItemsById);
router.delete('/:id',protect, deleteOrder);

export default router;