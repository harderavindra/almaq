import express from 'express';
import { createInvoice, deleteInvoice, getInvoiceById, InvoicesList, updateInvoicePaymentById } from '../controllers/invoice.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, InvoicesList);
router.get('/:id', protect, getInvoiceById);
router.put('/:id', protect, updateInvoicePaymentById);
router.delete('/:id', protect, deleteInvoice);
router.post('/', protect, createInvoice);
export default router; 