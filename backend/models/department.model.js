import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: String,
  address: String,
  contactPerson: String,
  contactNumber: String,
  orderLetterNumber: String,
  orderDate: Date
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);