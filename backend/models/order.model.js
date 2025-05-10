// models/order.model.js
import mongoose from "mongoose";

// Plant Entry Schema
const plantEntrySchema = new mongoose.Schema({
  plantType: { type: mongoose.Schema.Types.ObjectId, ref: "PlantType", required: true },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },

  // Delivery tracking
  deliveredQuantity: { type: Number, default: 0 },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Partially Delivered", "Delivered", "Returned"],
    default: "Pending"
  },
  deliveredAt: { type: Date },
  returnReason: String
});

// Item Schema (for each item in the order)
export const itemSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  plants: [plantEntrySchema],
  itemReferenceNumber: String,
  status: { type: String, enum: ["Pending", "InProgress", "Canceled", "Delivered"], default: "Pending" },
  overallDeliveryStatus: {
    type: String,
    enum: ["Pending", "InProgress", "Partially Delivered", "Fully Delivered", "Returned"],
    default: "Pending"
  },
  returnReason: { type: String }
}, { _id: true });

// Order Schema
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
