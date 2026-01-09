// models/taskModel.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskBatch",
    },

    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },

    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    taskType: {
      type: String,
      enum: ["call", "follow-up", "survey"],
      default: "call",
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    dueAt: { type: Date, index: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
