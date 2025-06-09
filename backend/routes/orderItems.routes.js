import express from 'express';
import OrderItem from '../models/OrderItem.js'; 
import { getOrderItemChallan, getOrderitemInvoice, getOrderItems, updateOrderItemStatus, updateOrderItemStatusAndQuantity } from '../controllers/orederItems.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/by-orders", async (req, res) => {
  try {
    const { orderIds } = req.params;
    const idsArray = Array.isArray(orderIds) ? orderIds : orderIds.split(",");
    const items = await OrderItem.find({ orderId: { $in: idsArray } })
    .populate("farmerId", "name")
    .populate("plantTypeId", "name");
    
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load order items." });
  }
});
router.get("/", protect, getOrderItems)
router.put('/status/:id',protect, updateOrderItemStatusAndQuantity);
  router.put("/:id/status",protect, updateOrderItemStatus)
  router.get("/invoice-items",protect, getOrderitemInvoice)
  router.get("/challan-items",protect, getOrderItemChallan)

export default router;