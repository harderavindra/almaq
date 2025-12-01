import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    fullName: { type: String },

    mobile: { type: String, required: true, index: true },
    altMobile: { type: String },
    email: { type: String },

    address: addressSchema,

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },

    category: { type: String }, // farmer, visitor, citizen, customer
    source: { type: String },   // manual, import, visitor

    tags: [String],

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto full name
contactSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName || ""}`.trim();
  next();
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
