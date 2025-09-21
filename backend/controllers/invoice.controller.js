import Invoice from '../models/Invoice.js';
import OrderItem from '../models/OrderItem.js';
import Farmer from '../models/Farmer.js';
import Order from '../models/Order.js';

export const createInvoice = async (req, res) => {
    console.log('Creating invoice with body:');
    try {
        const { orderId, farmerId, invoiceNumber, invoiceDate, vehicleFreight, agronomist } = req.body;
        
        // Check for existing Invoice
        const existingInvoice = await Invoice.findOne({ orderId, farmerId });
        if (existingInvoice) {
            return res.status(400).json({ message: 'Invoice already exists for this order and farmer.' });
        }

        // Get Order Items for the Farmer
        const orderItems = await OrderItem.find({ orderId, farmerId }).populate('farmerId','firstName lastName address phoneNumber taluka district state ');

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
            invoiceNumber,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
            vehicleFreight: vehicleFreight || 0,
            agronomist: agronomist || '',
            paymentStatus: 'Pending',
            createdBy: req.user ? req.user._id : null,
            updatedBy: req.user ? req.user._id : null,

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

        console.log(' OrderItems update result2:', updateResult);
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
            .populate({path:'orderId', populate:{path: 'departmentId'} }) ;

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

 export const updateInvoicePaymentById = async (req, res) => {
  try {
    const { amountReceived, paymentDate, paymentMode, paymentNotes, paymentStatus } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    invoice.amountReceived = amountReceived;
    invoice.paymentDate = paymentDate;
    invoice.paymentMode = paymentMode;
    invoice.paymentNotes = paymentNotes;
    invoice.paymentStatus = paymentStatus;
    invoice.paymentUpdatedBy = req.user ? req.user._id : null;
    
    await invoice.save();
    console.log('Success Updating ', invoice);
    res.json({ message: 'Payment updated successfully', invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const InvoicesList = async (req, res) => {
  try {
    const { month, year, status, department } = req.query;

    const filter = {};
    if (status) filter.paymentStatus = status;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.invoiceDate = { $gte: start, $lte: end };
    }

    let invoices = await Invoice.find(filter)
      .populate('farmerId', 'firstName lastName department')
      .sort({ createdAt: -1 });

    // Add totalPlants per invoice
    invoices = invoices.map((inv) => {
      const totalPlants = inv.items.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0);
      return { ...inv._doc, totalPlants };
    });

    // Group by department
    const grouped = {};
    for (const invoice of invoices) {
      const dep = invoice.farmerId?.department || 'Unknown';
      if (!grouped[dep]) grouped[dep] = [];
      grouped[dep].push(invoice);
    }

    // Collect distinct month/year
    const availableDates = await Invoice.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" }
          }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ]);

    const availableMonthYear = availableDates.map((d) => ({
      year: d._id.year,
      month: d._id.month,
    }));

    const result = Object.keys(grouped).map((dep) => ({
      department: dep,
      invoices: grouped[dep],
    }));

    res.json({ invoices: result, availableMonthYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE Invoice Controller
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Invoice exists
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Remove the Invoice
    await Invoice.findByIdAndDelete(id);

    // Remove the reference from OrderItems
    const updateResult = await OrderItem.updateMany(
      { invoiceId: id },
      { $unset: { invoiceId: "" } }
    );

    console.log('OrderItems updated after invoice deletion:', updateResult);

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
