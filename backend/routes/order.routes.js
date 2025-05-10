import express from "express";
import Order from "../models/order.model.js";
import { getOrders } from "../controllers/order.controller.js";

const router = express.Router();

// Create Order
router.post("/", async (req, res) => {
  console.log(req.body);
  
  const order = await Order.create(req.body);
  res.status(201).json(order);
});
router.get("/getOrders", getOrders) 
router.get("/", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const match = {};

    if (status) {
      match.status = status;
    }

    if (search) {
      match.$or = [
        { orderLetterNumber: { $regex: search, $options: "i" } },
        { "department.name": { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "farmers",
          localField: "items.farmer",
          foreignField: "_id",
          as: "items.farmerDetails",
        },
      },
      {
        $unwind: {
          path: "$items.farmerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: "$items.plants" },
      {
        $lookup: {
          from: "planttypes",
          localField: "items.plants.plantType",
          foreignField: "_id",
          as: "items.plants.plantTypeDetails",
        },
      },
      {
        $unwind: {
          path: "$items.plants.plantTypeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          department: { $first: "$department" },
          orderLetterNumber: { $first: "$orderLetterNumber" },
          orderDate: { $first: "$orderDate" },
          contactPerson: { $first: "$contactPerson" },
          contactNumber: { $first: "$contactNumber" },
          status: { $first: "$status" },
          orderReferenceNumber: { $first: "$orderReferenceNumber" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          items: {
            $push: {
              _id: "$items._id",
              farmer: "$items.farmer",
              farmerName: "$items.farmerDetails.name",
              itemReferenceNumber: "$items.itemReferenceNumber",
              status: "$items.status",
              plantType: "$items.plants.plantType",
              plantTypeName: "$items.plants.plantTypeDetails.name",
              quantity: "$items.plants.quantity",
              amount: "$items.plants.amount",
              deliveredQuantity: "$items.plants.deliveredQuantity",
              deliveryStatus: "$items.plants.deliveryStatus",
            },
          },
        },
      },
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ];

    const countPipeline = [
      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      { $match: match },
      { $count: "total" },
    ];

    const [orders, countResult] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      orders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
});

// Get Delivered Farmers (Pending Items)
router.get('/delivered-farmers', async (req, res) => {
  try {
    const orders = await Order.find({ 'items.status': 'Pending' })
      .populate('items.farmer')
      .populate('items.plants.plantType')
      .populate('department');

    const deliveredItems = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.status === 'Pending') {
          item.plants.forEach(plant => {
            deliveredItems.push({
              orderId: order._id,
              orderReferenceNumber: order.orderReferenceNumber,
              orderLetterNumber: order.orderLetterNumber,
              orderDate: order.orderDate,
              department: order.department,
              farmer: item.farmer,
              plantType: plant.plantType,
              quantity: plant.quantity,
              amount: plant.amount,
              itemId: item._id,
            });
          });
        }
      });
    });

    res.json({ farmers: deliveredItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivered farmers' });
  }
});

// Get Single Order
router.get('/:id', async (req, res) => {
  try {
    const orderJson =await Order.findById(req.params.id)
    console.log('Order JSON:', orderJson);

    // Iterate through the items and log the plant details for each farmer
    orderJson.items.forEach((item, index) => {
      console.log(`Farmer ${index + 1}:`, item.farmer);
      item.plants.forEach((plant, plantIndex) => {
        console.log(`  Plant ${plantIndex + 1}:`, plant);
      });
    });    
    const order = await Order.findById(req.params.id)
      .populate('department')
      .populate('items.farmer')
      .populate('items.plants.plantType');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Order
router.delete('/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Update Order Status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
