import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import Farmer from '../models/Farmer.js';
import PlantType from '../models/PlantType.js';
import Challan from '../models/Challan.js';
export const getOrderItems = async (req, res) => {
  try {
    // Find orders that are approved
    const approvedOrders = await Order.find({ status: "Approved" }).select('_id');

    const approvedOrderIds = approvedOrders.map(order => order._id);

    const query = {
      orderId: { $in: approvedOrderIds }
    };

    const orderItems = await OrderItem.find(query)
      .populate('orderId', 'orderRefNo orderDate status')
      .populate('farmerId', 'name contact')
      .populate('plantTypeId', 'name');

    console.log(orderItems, "orderItems");

    res.status(200).json(orderItems);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Failed to fetch order items.' });
  }
};
export const getOrderItemChallan = async (req, res) => {
  try {
    const {
      orderId,
      search = '',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
 const orderDetails = await Order.findById(orderId)
      .populate('departmentId', 'name') // populate department name if needed
      .lean();

    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Filter for OrderItems
    const filter = { orderId };

    // Search by farmer name
    if (search) {
      const farmerRegex = new RegExp(search, 'i');
      const matchingFarmers = await Farmer.find({
        $or: [{ firstName: farmerRegex }, { lastName: farmerRegex }],
      }).select('_id');
      filter.farmerId = { $in: matchingFarmers.map(f => f._id) };
    }

    const totalItems = await OrderItem.countDocuments(filter);

    const items = await OrderItem.find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate('farmerId', 'firstName lastName contactNumber')
      .populate('plantTypeId', 'name')
      .sort({ createdAt: -1 });

    // Gather all challanIds
    const allChallanIds = items.flatMap(item => item.challanIds || []);
    const challans = await Challan.find({ _id: { $in: allChallanIds } }).select('items');

    // Create a map of orderItemId -> total challanQuantity
    const quantityMap = {};
    challans.forEach(challan => {
      challan.items.forEach(({ orderItemId, challanQuantity }) => {
        const key = orderItemId.toString();
        quantityMap[key] = (quantityMap[key] || 0) + challanQuantity;
      });
    });

    const enrichedItems = items.map(item => ({
      ...item.toObject(),
      totalChallanQuantity: quantityMap[item._id.toString()] || 0,
    }));

    const pagination = {
      totalItems,
      currentPage: pageNum,
      totalPages: Math.ceil(totalItems / limitNum),
    };

    res.json({  order: orderDetails,items: enrichedItems, pagination });
  } catch (err) {
    console.error('Error fetching challan items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/orderItemController.js
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orderItem = await OrderItem.findById(id);
    if (!orderItem) return res.status(404).json({ message: 'OrderItem not found' });

    orderItem.status = status;
    await orderItem.save();

    return res.status(200).json({ message: 'Status updated', orderItem });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderItemStatusAndQuantity = async (req, res) => {
  const { id } = req.params;
  const { status, deliveredQuantity } = req.body;
  console.log("Updating order item with ID:", deliveredQuantity, id);
  console.log("New status:", status);
  try {
    const updated = await OrderItem.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(deliveredQuantity !== undefined && { deliveredQuantity }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Order item not found' });
    }

    res.status(200).json({ message: 'Order item updated', item: updated });
  } catch (err) {
    console.error('Failed to update order item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getOrderitemInvoice = async (req, res) => {
  const { orderId, farmerId } = req.query;

  console.log("Fetching order items for orderId:", orderId, "and farmerId:", farmerId);

  try {
    // Fetch the Order (with department details)
    const order = await Order.findById(orderId)
      .populate('departmentId', 'name contactPerson contactNumber');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch the Farmer details (if you have a separate Farmer model)
    const farmer = await Farmer.findById(farmerId);

    // Fetch the order items for the specific farmer
    const items = await OrderItem.find({ orderId, farmerId })
      .populate('plantTypeId', 'name')
      .populate('challanIds', 'challanNo vehicleId')
      .populate({
        path: 'challanIds.vehicleId',
        select: 'vehicleNumber driverName',
      });

    // Prepare the response object
    const invoiceData = {
      order: {
        _id: order._id,
        orderRefNo: order.orderRefNo,
        orderDate: order.orderDate,
        department: order.departmentId,
      },
      farmer: farmer
        ? {
            _id: farmer._id,
            name: farmer.name,
            address: farmer.address,
            contactNumber: farmer.contactNumber,
          }
        : null,
      items,
    };

    console.log("Fetched invoice data:", invoiceData);
    res.json(invoiceData);
  } catch (err) {
    console.error('Error fetching invoice data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const deletedItem = await OrderItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      item: deletedItem
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};