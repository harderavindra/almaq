// controllers/order.controller.js
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Farmer from '../models/Farmer.js'; // Assuming you have a Farmer model
import Department from '../models/Department.js';

export const createOrder = async (req, res) => {
  try {
    const { departmentId, orderRefNo, orderLetterNumber, contactPerson, contactNumber, orderDate, status, items } = req.body;

    const order = await Order.create({ departmentId, orderRefNo, orderLetterNumber, contactPerson, contactNumber, orderDate, status });
    const orderItems = items.map(item => ({
      orderId: order._id,
      farmerId: item.farmerId,
      plantTypeId: item.plantTypeId,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit
    }));

    await OrderItem.insertMany(orderItems);

    res.status(201).json({ message: 'Order created successfully', orderId: order._id });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};


export const getOrderWithItemsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order
    const order = await Order.findById(id).populate('departmentId');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Fetch order items linked to this order
    const orderItems = await OrderItem.find({ orderId: id })
      .populate('farmerId')
      .populate('plantTypeId')
      .populate({
        path: 'challanIds',
        select: 'challanNo deliveryDate vehicleId notes', // include relevant fields
        populate: {
          path: 'vehicleId',
          select: 'vehicleNumber driverName'
        }
      });;

    res.json({ order, items: orderItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getOrders = async (req, res) => {
  try {
    console.log();
    let { page = 1, limit = 10, status } = req.query;
    console.log(status);
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    const filter = {};
    if (status) {
      filter.status = status;
    }


    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 }) // Show most recent orders first
      .populate("departmentId", "name")

      ; // Adjust based on department model

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


export const getOrdersWithItems = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? { orderRefNo: { $regex: search, $options: "i" } }
      : {};

    const orders = await Order.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .sort({ updatedAt: -1 })
      ;

    const totalOrders = await Order.countDocuments(query);

    const orderIds = orders.map((order) => order._id);

    const orderItems = await OrderItem.find({ orderId: { $in: orderIds } })
      .populate("farmerId", "name")
      .populate("plantTypeId", "name")
      .lean();

    // Group order items by orderId
    const itemsByOrderId = {};
    orderItems.forEach((item) => {
      const key = item.orderId.toString();
      if (!itemsByOrderId[key]) itemsByOrderId[key] = [];
      itemsByOrderId[key].push(item);
    });

    // Attach orderItems to corresponding order
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrderId[order._id.toString()] || [],
    }));

    res.json({
      orders: ordersWithItems,
      totalOrders,
    });
  } catch (err) {
    console.error("Error fetching orders with items:", err);
    res.status(500).json({ message: "Failed to fetch orders with items." });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // ❗ Delete all related order items
    await OrderItem.deleteMany({ orderId: id });

    return res.status(200).json({ message: 'Order and related order items deleted successfully', deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status input
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Check if the order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Server error while updating order status',
      error: error.message
    });
  }
};

export const getOrderStatusCounts = async (req, res) => {
  console.log("Fetching order status counts...");
  try {
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to a key-value object: { Pending: 5, Completed: 3, ... }
    const formattedCounts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json(formattedCounts);
  } catch (error) {
    console.error("Error getting order status counts:", error);
    res.status(500).json({ error: "Failed to get status counts" });
  }
};