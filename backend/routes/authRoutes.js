import express from 'express';
import multer from 'multer';

import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  refreshToken,
  getProfilePicUploadUrl,
  getFileUrl
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
router.get('/', protect, isAdmin, getAllUsers);
router.post('/getfileUrl', getFileUrl);
router.post('/get-upload-url', getProfilePicUploadUrl);


// router.post('/delete-profile-pic', deleteProfilePic); // Optional: implement



export default router;
