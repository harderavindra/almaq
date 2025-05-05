import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  plantType: { type: mongoose.Schema.Types.ObjectId, ref: "Plant" },
  quantity: Number,
  amount: Number,
  status: { type: String, enum: ["Pending", "InProgress", "Canceled", "Delivered"], default: "Pending" },
  itemReferenceNumber: String,
});

const orderSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  items: [itemSchema],
  orderLetterNumber: { type: String, required: true, unique: true },
  orderDate: { type: Date, default: Date.now },
  contactPerson: String,
  contactNumber: String,
  status: { type: String, enum: ["Draft", "Submitted", "Approved", "Delivered", "Cancelled"], default: "Draft" },
  orderReferenceNumber: String,
}, { timestamps: true });

// Pre-save hook to generate reference numbers
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    const baseRef = this.orderLetterNumber || `ORD-${Date.now()}`;
    this.orderReferenceNumber = baseRef;

    this.items.forEach((item, index) => {
      item.itemReferenceNumber = `${baseRef}-ITEM-${index + 1}`;
    });
  }
  next();
});

export default mongoose.model('Order', orderSchema);
