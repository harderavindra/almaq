import mongoose from "mongoose";

// Rename the model to reflect "PlantType" if that's your intention
const plantTypeSchema = new mongoose.Schema({
  name: String, // assuming you want a name field to match your pipeline
  price: Number,  // assuming each plant type has a price
}, { timestamps: true });

export default mongoose.model("PlantType", plantTypeSchema);