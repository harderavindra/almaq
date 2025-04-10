import express from 'express';
import multer from 'multer';

import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  refreshToken,
  deleteProfilePic,
  uploadProfilePic
} from '../controllers/authController.js';

import {
  protect,
  isAdmin
} from '../middlewares/authMiddleware.js';

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });


// Auth Routes
router.post('/register',upload.single('profilePic'), protect, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken); // this is the route you need
// Protected Route (Admin only)
router.get('/', protect, isAdmin, getAllUsers);


router.post('/upload-profile-pic', upload.single('profilePic'), protect, uploadProfilePic); // Handles uploading profile pic
router.post('/delete-profile-pic', protect, deleteProfilePic); // Handles deleting profile pic


export default router;
