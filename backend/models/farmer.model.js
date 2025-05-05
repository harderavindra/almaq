// models/farmer.model.js
import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contactNumber: String,
}, { timestamps: true });

const Farmer = mongoose.model("Farmer", farmerSchema);
export default Farmer;
