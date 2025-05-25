import express from 'express';
import multer from 'multer';

import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  refreshToken,
  deleteProfilePic,
  updateProfilePic,
  updateProfile,
  getProfile,
  deleteUser,
} from '../controllers/authController.js';

import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';

const router = express.Router();





// Auth Routes
router.post('/register', protect, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken); // this is the route you need
// Protected Route (Admin only)
router.get('/users', protect, isAdmin, getAllUsers);
router.put('/update-profile-pic', updateProfilePic)
router.post('/delete-file', deleteProfilePic);
router.route('/users/:userId')
  .get(protect, getProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteUser)
  ;




export default router;
