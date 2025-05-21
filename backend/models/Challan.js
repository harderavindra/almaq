// models/Challan.js
import mongoose from 'mongoose';
const challanItemSchema = new mongoose.Schema({
  orderItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: { type: String, enum: ['Pending', 'Delivered'], default: 'Pending' }

});

const challanSchema = new mongoose.Schema({
  challanNo: { type: String, required: true, unique: true }, // e.g., CHLN-2024-0012
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },

  dispatchDate: { type: Date, default: Date.now },
  routeDetails: { type: String },
  items: {
    type: [challanItemSchema],
    validate: [arr => arr.length > 0, 'Challan must contain at least one item']
  },
  notes: { type: String }
},{
  timestamps: true
});

export default mongoose.model('Challan', challanSchema);