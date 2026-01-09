import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    // Auto-linked contact (optional)
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },

    // Basic identity
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, index: true },

    // ID Proof
    idProofType: { type: String },
    idProofNumber: { type: String },

    // Visit information
    purpose: { type: String, required: true },
    toMeet: { type: String }, // person or department

    visitType: {
      type: String,
      enum: ["walk-in", "scheduled"],
      default: "walk-in",
    },

    // Location reference (office / center / building)
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: false,
    },

    // Visit time tracking
    inTime: { type: Date, default: Date.now },
    outTime: { type: Date },

    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed", "cancelled"],
      default: "waiting",
    },

    remarks: { type: String },

    // Meta
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;
