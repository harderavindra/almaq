import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import Farmer from '../models/Farmer.js';
import PlantType from '../models/PlantType.js';
export const getOrderItems = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
  orderId: { $exists: true, $ne: null } // ensures field exists and is not null
};
    if (status) {
      query.status = status;
    }

    const orderItems = await OrderItem.find(query)
      .populate('orderId', 'orderRefNo orderDate')
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