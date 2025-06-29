// routes/report.js
import express from 'express';
import { getDashboardStats, ordersDeliveredDuration, ordersOverTime, ordersPlacedDuration, ordersThisMonth } from '../controllers/report.controller.js';

const router = express.Router();

router.get('/orders-over-time',ordersOverTime ); 
router.get('/orders-this-month',ordersThisMonth ); 
router.get('/orders-placed-duration' ,ordersPlacedDuration );
router.get('/orders-delivered-duration' ,ordersDeliveredDuration );
router.get('/stats', getDashboardStats);

export default router;
