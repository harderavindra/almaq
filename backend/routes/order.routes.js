import express from 'express';
import { createOrder, deleteOrder, getOrders, getOrderStatusCounts, getOrdersWithItems, getOrderWithItemsById,updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();
router.get('/status-counts', getOrderStatusCounts);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/with-items', getOrdersWithItems);
router.put('/:id/status', updateOrderStatus);
router.get('/:id', getOrderWithItemsById);
router.delete('/:id', deleteOrder);

export default router;