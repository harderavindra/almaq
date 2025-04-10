import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  refreshToken
} from '../controllers/authController.js';

import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Auth Routes
router.post('/register',protect, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken); // this is the route you need
// Protected Route (Admin only)
router.get('/', protect, isAdmin, getAllUsers);

export default router;
