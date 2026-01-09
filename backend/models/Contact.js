import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    state: String,
    district: String,
    taluka: String,
    city: String,
    addressLine: String,
    pincode: String,
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    // Basic identity
    firstName: { type: String, required: true },
    lastName: { type: String },
    fullName: String,

    // Phones
    mobile: { type: String, required: true, index: true },
    altMobile: String,

    // Communication
    email: String,
    preferredLanguage: { type: String, default: "marathi" },

    // Categorization & grouping
    categories: [{ type: String }],  // instead of category: "farmer"
    tags: [String],

    source: { type: String, default: "manual" },

    // Location
    address: addressSchema,

    // CRM fields
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastActivity: Date,
    totalNotes: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    totalCalls: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },

    // Call center fields
    doNotDisturb: { type: Boolean, default: false },
    callStatus: {
      type: String,
      enum: ["new", "in-progress", "completed", "unreachable", "callback"],
      default: "new",
    },

    // Activity tracking
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

export default mongoose.model("Contact", contactSchema);
