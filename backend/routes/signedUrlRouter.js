import express from 'express';
import { getSignedUrlHandler } from '../controllers/signedUrlController.js';

const router = express.Router();

// Route to handle both upload and view signed URL generation
router.get('/signed-url', getSignedUrlHandler);

export default router; 
