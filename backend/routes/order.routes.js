import express from "express";
import Order from "../models/order.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

router.get("/", async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = status ? { status } : {};
    
        const total = await Order.countDocuments(filter);
        const orders = await Order
          .find(filter)
          .populate('department')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));
    
        res.json({
          total,
          page: Number(page),
          limit: Number(limit),
          orders
        });
      } catch (err) {
        next(err);
      }
});
router.get('/delivered-farmers', async (req, res) => {
  try {
   
    const orders = await Order.find({ 'items.status': 'Pending' })
    .populate('items.farmer')
    .populate('items.plantType')
    .populate('department');
    
    console.log(orders);
const deliveredItems = [];


    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.status === 'Pending') {
          deliveredItems.push({
            orderId: order._id,
            orderReferenceNumber: order.orderReferenceNumber,
            orderLetterNumber: order.orderLetterNumber,
            orderDate: order.orderDate,
            department: order.department,
            farmer: item.farmer,
            plantType: item.plantType,
            quantity: item.quantity,
            amount: item.amount,
            itemId: item._id,
          });
        }
      });
    });

    res.json({ farmers: deliveredItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivered farmers' });
  }
});
router.get('/:id', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('department')
        .populate('items.farmer')
        .populate('items.plantType');
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.json(order);
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  

export default router;