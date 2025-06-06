import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  agronomist:String,
  vehicleFreight: Number,
  
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' },
      name: String,
      deliveredQuantity: Number,
      price: Number,
      subtotal: Number,
    },
  ],

  totalAmount: Number,

  // Payment Tracking
  paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid'], default: 'Pending' },
  amountReceived: { type: Number, default: 0 },
  paymentDate: { type: Date, default: null },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', ''], default: '' },
  paymentNotes: { type: String, default: '' },

  // Audit Fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

invoiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Invoice', invoiceSchema);