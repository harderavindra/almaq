import express from 'express';
import { addItemToOrder, createOrder, deleteOrder, getDraftOrderById, getOrders, getOrderStatusCounts, getOrdersWithItems, getOrderWithItemsById,searchOrders,updateOrderStatus } from '../controllers/order.controller.js';
import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.get('/search',searchOrders);

router.get('/status-counts',protect, getOrderStatusCounts);
router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/with-items', protect, getOrdersWithItems);
router.put('/:id/status', protect, updateOrderStatus);
router.get('/:id/draft', protect, getDraftOrderById);
router.get('/:id', protect, getOrderWithItemsById);
router.delete('/:id',protect, deleteOrder);
router.post('/:orderId/item', addItemToOrder);

export default router;