import express from 'express';
import OrderItem from '../models/OrderItem.js'; 
import { getOrderitemInvoice, getOrderItems, updateOrderItemStatus, updateOrderItemStatusAndQuantity } from '../controllers/orederItems.controller.js';

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
router.get("/", getOrderItems)
router.put('/status/:id', updateOrderItemStatusAndQuantity);
  router.put("/:id/status", updateOrderItemStatus)
  router.get("/invoice-items", getOrderitemInvoice)

export default router;