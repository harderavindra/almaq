import express from 'express';
import { createInvoice, getInvoiceById } from '../controllers/invoice.controller.js';

const router = express.Router();

router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
export default router; 