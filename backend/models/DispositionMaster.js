import mongoose from "mongoose";

const dispositionMasterSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // e.g. connected, callback, busy
      lowercase: true,
      trim: true,
    },

    label: {
      type: String,
      required: true, // Human readable
    },

    category: {
      type: String,
      enum: ["final", "retry"],
      required: true,
    },

    taskStatus: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      required: true,
    },

       requiresCallOutcome: {
      type: Boolean,
      default: false,
    },
 

    requiresFollowUpDate: {
      type: Boolean,
      default: false,
    },

    incrementAttempt: {
      type: Boolean,
      default: false,
    },

    maxAttemptsAllowed: {
      type: Number,
      default: null, // null = use task.maxAttempts
    },

    active: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "DispositionMaster",
  dispositionMasterSchema
);
