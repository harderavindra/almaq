// models/OrderItem.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order',  index: true  },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  plantTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantType' },
  quantity: Number,
  pricePerUnit: Number,
  deliveredQuantity: { type: Number, default: 0 },
  challanIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challan' }],
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  status: { type: String, enum: ['Pending', 'Partially Delivered', 'Delivered'], default: 'Pending' }
}, { timestamps: true });


export default mongoose.model('OrderItem', orderItemSchema);