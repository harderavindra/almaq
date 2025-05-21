// utils/generateDocumentNumber.js
import Counter from '../models/Counter.js';

export const generateDocumentNumber = async (type) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = type.toUpperCase(); // 'ORD', 'CHL', 'INV'
  const counterId = `${prefix}-${year}-${month}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequence = String(counter.seq).padStart(4, '0');
  return `${prefix}/${year}/${month}/${sequence}`;
};
