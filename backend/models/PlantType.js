import mongoose from 'mongoose';

const plantTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  HSN: String,
  ratePerUnit: { type: Number, required: true }, // ₹ per plant
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('PlantType', plantTypeSchema);
