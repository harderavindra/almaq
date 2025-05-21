import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  transportName: { type: String, required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driverContact: { type: String },
  vehicleType: { type: String },
  registrationDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);
export default Vehicle;