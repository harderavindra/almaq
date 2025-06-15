import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: String,
  contactNumber: String,
  state: { type: String, required: true },
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  deactivatedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
