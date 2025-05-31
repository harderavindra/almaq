// models/farmer.model.js
import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true, enum:['male', 'female', 'other'] },
  contactNumber: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  taluka: { type: String, required: true },
  city: { type: String, required: false },
  address: { type: String, required: false },
  idNumber: { type: String, required: false, unique: true },
}, { timestamps: true });

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
