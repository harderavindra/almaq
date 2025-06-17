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
      existingSearch = '',
      availableSearch = '',
      existingPage = 1,
      availablePage = 1,
      limit = 10,
    } = req.query;

    const limitNum = parseInt(limit);
    const existingPageNum = parseInt(existingPage);
    const availablePageNum = parseInt(availablePage);

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const orderDetails = await Order.findById(orderId)
      .populate('departmentId', 'name')
      .lean();

    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Initial filter
    const baseFilter = { orderId };

    // Fetch all items once
    const allItems = await OrderItem.find(baseFilter)
      .populate('farmerId', 'firstName lastName contactNumber')
      .populate('plantTypeId', 'name');

    // Sort items by farmer name
    allItems.sort((a, b) => {
      const nameA = `${a.farmerId?.firstName || ''} ${a.farmerId?.lastName || ''}`.toLowerCase();
      const nameB = `${b.farmerId?.firstName || ''} ${b.farmerId?.lastName || ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Get all challan quantities
    const allChallanIds = allItems.flatMap(item => item.challanIds || []);
    const challans = await Challan.find({ _id: { $in: allChallanIds } }).select('items');

    const quantityMap = {};
    challans.forEach(challan => {
      challan.items.forEach(({ orderItemId, challanQuantity }) => {
        const key = orderItemId.toString();
        quantityMap[key] = (quantityMap[key] || 0) + challanQuantity;
      });
    });

    // Enrich items with totalChallanQuantity
    const enrichedItems = allItems.map(item => ({
      ...item.toObject(),
      totalChallanQuantity: quantityMap[item._id.toString()] || 0,
    }));

    // Filtering logic
    const matchFarmer = async (searchText) => {
      if (!searchText) return null;
      const regex = new RegExp(searchText, 'i');
      const farmers = await Farmer.find({
        $or: [{ firstName: regex }, { lastName: regex }],
      }).select('_id');
      return farmers.map(f => f._id.toString());
    };

    const existingFarmerIds = await matchFarmer(existingSearch);
    const availableFarmerIds = await matchFarmer(availableSearch);

    const existingItemsFull = enrichedItems.filter(i =>
      i.totalChallanQuantity > 0 &&
      (!existingFarmerIds || existingFarmerIds.includes(i.farmerId?._id.toString()))
    );

    const availableItemsFull = enrichedItems.filter(i =>
      i.totalChallanQuantity < i.quantity &&
      (!availableFarmerIds || availableFarmerIds.includes(i.farmerId?._id.toString()))
    );

    const existingTotalPages = Math.ceil(existingItemsFull.length / limitNum);
    const availableTotalPages = Math.ceil(availableItemsFull.length / limitNum);

    const paginatedExisting = existingItemsFull.slice(
      (existingPageNum - 1) * limitNum,
      existingPageNum * limitNum
    );

    const paginatedAvailable = availableItemsFull.slice(
      (availablePageNum - 1) * limitNum,
      availablePageNum * limitNum
    );

    res.json({
      order: orderDetails,
      existingItems: paginatedExisting,
      existingPagination: {
        currentPage: existingPageNum,
        totalPages: existingTotalPages,
        totalItems: existingItemsFull.length,
      },
      availableItems: paginatedAvailable,
      availablePagination: {
        currentPage: availablePageNum,
        totalPages: availableTotalPages,
        totalItems: availableItemsFull.length,
      },
    });
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
          firstName: farmer.firstName,
          lastName: farmer.lastName,
          address: farmer.address,
          taluka: farmer.taluka,
          district: farmer.district,
          state: farmer.state,
          city: farmer.city,
          contactNumber: farmer.contactNumber,
        }
        : null,
      items,
    };

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