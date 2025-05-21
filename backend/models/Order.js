import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  orderRefNo: String,
  orderLetterNumber:String,
  contactPerson: String,
  contactNumber: String,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Draft" }
}, { timestamps: true });


export default mongoose.model("Order", orderSchema);
