import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  orderRefNo: String,
  orderLetterNumber:String,
  contactPerson: String,
  contactNumber: String,
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Draft" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [statusHistorySchema],
}, { timestamps: true });


export default mongoose.model("Order", orderSchema);
