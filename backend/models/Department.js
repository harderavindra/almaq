import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: String,
  contactNumber: String,
  address: String,
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('Department', departmentSchema);
