// models/campaignModel.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: String,
    description: String,

    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
