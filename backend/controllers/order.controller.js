// controllers/order.controller.js
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Farmer from '../models/Farmer.js'; // Assuming you have a Farmer model
import Department from '../models/Department.js';
import Invoice from '../models/Invoice.js';
import Challan from '../models/Challan.js';

export const createOrder = async (req, res) => {
  try {
    const { departmentId, orderRefNo, orderLetterNumber, contactPerson, contactNumber, orderDate, status } = req.body;

    const order = await Order.create({
      departmentId,
      orderRefNo,
      orderLetterNumber,
      contactPerson,
      contactNumber,
      orderDate,
      status: status || 'Draft',
      createdBy: req.user._id,
      statusHistory: [
        {
          status: status || 'Draft',
          updatedBy: req.user._id,
          updatedAt: new Date(),
        },
      ],

    });


    res.status(201).json({ message: 'Order created successfully', orderId: order._id });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getDraftOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch order details
    const order = await Order.findById(id)
      .populate('departmentId', 'name state district taluka contactNumber contactPerson address')
      .populate('createdBy', 'firstName lastName email')
      .populate('statusHistory.updatedBy', '-_id firstName lastName email profilePic');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Count total items (for pagination)
    const totalItems = await OrderItem.countDocuments({ orderId: id });

    // Fetch paginated items
    const orderItems = await OrderItem.find({ orderId: id })
      .skip(skip)
      .limit(limit)
      .populate('farmerId', 'firstName lastName contactNumber district taluka')
      .populate('plantTypeId', 'name ratePerUnit')
      .populate({
        path: 'challanIds',
        select: 'challanNo quantity deliveryDate vehicleId notes',
        populate: {
          path: 'vehicleId',
          select: 'vehicleNumber driverName'
        }
      });

    // Group items by farmerId (without invoice)
    const totalCount = await OrderItem.countDocuments({ orderId: id });

    const orderItemIds = orderItems.map(item => item._id);

    // Step 2: Fetch challans referencing these order items
    const challans = await Challan.find({
      'items.orderItemId': { $in: orderItemIds }
    }).select('items');

    // Step 3: Build challan quantity map per orderItemId
    const challanDataMap = {}; // { orderItemId: [ { challanId: quantity }, ... ] }

    for (const challan of challans) {
      for (const chItem of challan.items) {
        const itemId = chItem.orderItemId.toString();
        if (!challanDataMap[itemId]) challanDataMap[itemId] = [];

        challanDataMap[itemId].push({ [challan._id.toString()]: chItem.quantity });
      }
    }

    // Step 4: Enrich order items with challan data
    const enrichedItems = orderItems.map(item => {
      const itemId = item._id.toString();
      const challanEntries = challanDataMap[itemId] || [];
      const totalChallan = challanEntries.reduce(
        (sum, entry) => sum + Object.values(entry)[0],
        0
      );

      return {
        ...item.toObject(),
        challanIds: challanEntries,
        TotalChallan: totalChallan
      };
    });

    // Step 5: Group by farmer
    const groupedByFarmer = {};

    for (const item of enrichedItems) {
      const farmerId = item.farmerId?._id?.toString() || 'Unknown';

      if (!groupedByFarmer[farmerId]) {
        groupedByFarmer[farmerId] = {
          farmer: item.farmerId,
          items: []
        };
      }

      groupedByFarmer[farmerId].items.push(item);
    }

    const groupedData = Object.values(groupedByFarmer);

    // Summary from ALL orderItems (not paginated)
    const allOrderItems = await OrderItem.find({ orderId: id });
    const uniqueFarmerIds = new Set(allOrderItems.map(i => i.farmerId?.toString()));
    const totalFarmers = uniqueFarmerIds.size;
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of allOrderItems) {
      totalQuantity += item.quantity;
      totalAmount += item.quantity * item.pricePerUnit;
    }

    // Response
    res.json({
      order,
      items: groupedData,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit
      },
      summary: {
        totalFarmers,
        totalQuantity,
        totalAmount
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//order viwe page
export const getOrderWithItemsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order
    const order = await Order.findById(id)
      .populate('departmentId', 'name contactNumber contactPerson city taluka district')
      .populate('createdBy', 'firstName lastName email')
      .populate('statusHistory.updatedBy', '-_id firstName lastName email profilePic');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Fetch order items
    const orderItems = await OrderItem.find({ orderId: id })
      .populate('farmerId', 'firstName lastName  address taluka')
      .populate('plantTypeId', 'name ratePerUnit')
      .populate({
        path: 'challanIds',
        select: 'challanNo deliveryDate vehicleId notes',
        populate: {
          path: 'vehicleId',
          select: 'vehicleNumber driverName'
        }
      });

    // Group items by farmerId
    const groupedByFarmer = {};

    for (const item of orderItems) {
      const farmerId = item.farmerId?._id?.toString() || 'Unknown';

      // If this farmer group hasn't been initialized, do it now
      if (!groupedByFarmer[farmerId]) {
        groupedByFarmer[farmerId] = {
          farmer: item.farmerId, // farmer details
          items: [],
          invoice: null // Placeholder for invoice details
        };

        // Fetch invoice for this order and farmer (if any)
        const invoice = await Invoice.findOne({
          orderId: id,
          farmerId: farmerId
        }).select('invoiceNumber invoiceDate paymentStatus amountReceived paymentDate paymentMode');

        if (invoice) {
          groupedByFarmer[farmerId].invoice = invoice;
        }
      }

      // Push the order item
      groupedByFarmer[farmerId].items.push(item);
    }

    const groupedData = Object.values(groupedByFarmer);

    // Summary from ALL orderItems (not paginated)
    const allOrderItems = await OrderItem.find({ orderId: id });
    const uniqueFarmerIds = new Set(allOrderItems.map(i => i.farmerId?.toString()));
    const totalFarmers = uniqueFarmerIds.size;
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of allOrderItems) {
      totalQuantity += item.quantity;
      totalAmount += item.quantity * item.pricePerUnit;
    }

    res.json({ order, items: groupedData, 
      summary: {
        totalFarmers,
        totalQuantity,
        totalAmount
      } });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;
    console.log(page,"page")
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
      .sort({ orderRefNo: -1 }) // Show most recent orders first
      .populate("departmentId", "name taluka district")

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
    console.log("Updating order status for ID:", req.params);
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

    // Add status change to statusHistory
    order.statusHistory.push({
      status: status,
      updatedBy: req.user._id, // Ensure you have the user object available in req.user (e.g., via auth middleware)
      updatedAt: new Date()
    });

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


export const addItemToOrder = async (req, res) => {
  console.log("Add items")
  try {
    const { orderId } = req.params;
    let { farmerId, plantTypeId, quantity, pricePerUnit, newFarmer } = req.body;

    if (!plantTypeId || !quantity || !pricePerUnit) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate order existence
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
console.log("Received newFarmer:", newFarmer);

    // Step 1: If newFarmer is present, create farmer
    if (!farmerId && newFarmer) {
      const createdFarmer = await Farmer.create(newFarmer);
      farmerId = createdFarmer._id;
    }

    if (!farmerId) {
      return res.status(400).json({ success: false, message: 'Farmer ID is required' });
    }

    // Step 2: Prevent duplicate entry
    const existingItem = await OrderItem.findOne({
      orderId,
      farmerId,
      plantTypeId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'This farmer and plant type is already added to this order.'
      });
    }

    // Step 3: Save the OrderItem
    const newItem = new OrderItem({
      orderId,
      farmerId,
      plantTypeId,
      quantity,
      pricePerUnit
    });

    await newItem.save();

    return res.status(200).json({
      success: true,
      message: 'Item added to order successfully',
      item: newItem
    });

  } catch (error) {
    
    console.error('Error adding item:', error);

    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
       success: false,
  message: 'Server error',
  error: error.message,
  stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

export const searchOrders = async (req, res) => {
  try {
    const search = req.query.search?.trim() || '';
    const state = req.query.state?.trim();
    const district = req.query.district?.trim();
    const taluka = req.query.taluka?.trim();

    const orderConditions = [];
    if (search) {
      orderConditions.push(
        { orderRefNo: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      );
    }

    const departmentMatch = {};
    if (state) departmentMatch['department.state'] = state;
    if (district) departmentMatch['department.district'] = district;
    if (taluka) departmentMatch['department.taluka'] = taluka;

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      {
        $match: {
          ...(orderConditions.length > 0 && { $or: orderConditions }),
          ...departmentMatch,
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 30 },
      {
        $project: {
          _id: 1,
          orderRefNo: 1,
          orderLetterNumber: 1,
          contactPerson: 1,
          contactNumber: 1,
          orderDate: 1,
          status: 1,
          createdBy: 1,
          statusHistory: 1,
          createdAt: 1,
          updatedAt: 1,
          departmentId: {
            _id: '$department._id',
            name: '$department.name',
            contactPerson: '$department.contactPerson',
            contactNumber: '$department.contactNumber',
            address: '$department.address',
            state: '$department.state',
            district: '$department.district',
            taluka: '$department.taluka',
          },
        },
      },
    ]);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error during order search:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};