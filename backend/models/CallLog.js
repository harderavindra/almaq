// models/callLogModel.js
import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    callStart: Date,
    callEnd: Date,
    duration: Number,

    disposition: {
      type: String,
      enum: [
        "connected",
        "no-answer",
        "busy",
        "callback",
        "not-interested",
        "wrong-number",
        "dnd",
      ],
    },
     callOutcome: {
      type: mongoose.Schema.Types.Mixed, // JSON answers
      default: {},
    },
    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("CallLog", callLogSchema);
