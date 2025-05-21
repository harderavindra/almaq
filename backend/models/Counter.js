// models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,        // e.g., 'ORD-2025-05'
  seq: { type: Number, default: 0 }
});

export default mongoose.model('Counter', counterSchema);
