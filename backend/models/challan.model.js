import mongoose from "mongoose";
import { itemSchema } from "./order.model.js"; // Import itemSchema from Order model

// Challan Schema
const challanSchema = new mongoose.Schema(
  {
    challanDate: { type: Date, default: Date.now },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driverName: { type: String },
    departureTime: { type: Date },
    arrivalTime: { type: Date },
    routeDetails: { type: String },
    notes: { type: String },
    items: [
      {
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
        plants: [
          {
            plantType: { type: mongoose.Schema.Types.ObjectId, ref: "PlantType", required: true },
            quantity: { type: Number, required: true },
            amount: { type: Number, required: true },
            deliveredQuantity: { type: Number, default: 0 },
            deliveryStatus: {
              type: String,
              enum: ["Pending", "Partially Delivered", "Delivered", "Returned"],
              default: "Pending",
            },
            deliveredAt: { type: Date },
            returnReason: { type: String },
          },
        ],
        itemReferenceNumber: String,
        status: {
          type: String,
          enum: ["Pending", "InProgress", "Canceled", "Delivered"],
          default: "Pending",
        },
        overallDeliveryStatus: {
          type: String,
          enum: ["Pending", "InProgress", "Partially Delivered", "Fully Delivered", "Returned"],
          default: "Pending",
        },
        returnReason: { type: String },
      },
    ],
    deliveryLog: [
      {
        status: { type: String, enum: ["Packed", "In Transit", "Delivered", "Returned"] },
        updatedAt: { type: Date, default: Date.now },
        remarks: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Challan", challanSchema);
