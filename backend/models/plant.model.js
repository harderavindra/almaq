import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
  type: String,
  price: Number
}, { timestamps: true });

export default mongoose.model("Plant", plantSchema);
