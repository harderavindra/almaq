// controllers/utilityController.js
import { generateDocumentNumber } from '../utils/generateDocumentNumber.js';

export const getNextNumber = async (req, res) => {
  try {
    const { type } = req.query; // 'ORD' | 'CHL' | 'INV'
    const number = await generateDocumentNumber(type);
    res.status(200).json({ number });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate number' });
  }
};
