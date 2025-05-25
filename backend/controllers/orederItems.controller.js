import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import Farmer from '../models/Farmer.js';
import PlantType from '../models/PlantType.js';
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
