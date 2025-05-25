import Invoice from '../models/Invoice.js';
import OrderItem from '../models/OrderItem.js';
import Farmer from '../models/Farmer.js';
import Order from '../models/Order.js';

export const createInvoice = async (req, res) => {
    console.log('Creating invoice with body:');  
  try {
    const { orderId, farmerId } = req.body;

    // Check for existing Invoice
    const existingInvoice = await Invoice.findOne({ orderId, farmerId });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this order and farmer.' });
    }

    // Get Order Items for the Farmer
    const orderItems = await OrderItem.find({ orderId, farmerId });

    if (!orderItems.length) {
      return res.status(400).json({ message: 'No items found for this order and farmer.' });
    }

    // Check if all items are Delivered
    const allDelivered = orderItems.every(item => item.status === 'Delivered');
    if (!allDelivered) {
      return res.status(400).json({ message: 'All items are not delivered yet.' });
    }

    // Prepare Invoice Data
    const invoiceItems = orderItems.map(item => ({
      itemId: item._id,
      name: item.name || 'Unnamed Item', // Added fallback
      deliveredQuantity: item.deliveredQuantity,
      price: item.pricePerUnit || 0, // Correct field: pricePerUnit
      subtotal: (item.pricePerUnit || 0) * (item.deliveredQuantity || 0),
    }));

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create Invoice
    const newInvoice = new Invoice({
      orderId,
      farmerId,
      items: invoiceItems,
      totalAmount,
    });

    await newInvoice.save();
console.log('Updating OrderItems for:', {
  orderId,
  farmerId,
  invoiceId: newInvoice._id
});
// Update OrderItems with invoiceId
const updateResult = await OrderItem.updateMany(
  { orderId, farmerId },
  { $set: { invoiceId: newInvoice._id } }
);

console.log('✅ OrderItems update result:', updateResult);
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: newInvoice,
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInvoiceById = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await Invoice.findById(id)
      .populate('farmerId')
      .populate({
    path: 'items.itemId',
    populate: {
      path: 'plantTypeId', // This will populate plantTypeId inside itemId
    },
  })
      .populate('orderId')
      ; // Assuming your invoice has items with plantTypeId

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


