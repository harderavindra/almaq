import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { deleteFileFromGCS, generateSignedUploadUrl, generateSignedUrl } from '../utils/generateSignedUrl.js';

import fs from 'fs';
import { console } from 'inspector/promises';
import bcrypt from 'bcryptjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc   Register new user
export const registerUser = async (req, res) => {
  const { firstName, lastName, gender, email, password, role, profilePic } = req.body;
  console.log("Registering user:", req.body);

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ firstName, lastName, gender, email, password, role, profilePic });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      token: generateAccessToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc   Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res
      .cookie('token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: 'Login successful.',
        accessToken,          // ✅ ADD THIS
    refreshToken,         // ✅ ADD THIS (mobile only)
        data: {
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
          profilePic: user?.profilePic,
        },
      });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while logging in. Please try again.',
    });
  }
};




export const refreshToken = async (req, res) => {
  const refresh = req.cookies?.refreshToken;
  if (!refresh) {
    return res.status(401).json({
      success: false,
      message: 'Session expired. Please log in again.',
    });
  }

  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !(await bcrypt.compare(refresh, user.refreshToken))) {
      return res.status(403).json({
        success: false,
        message: 'Invalid session. Please log in again.',
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res
      .cookie('token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: 'Session refreshed.',
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic
        },
      });
  } catch (err) {
    console.error('[Refresh Error]', err);
    return res.status(403).json({
      success: false,
      message: 'Session expired or invalid. Please log in again.',
    });
  }
};
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { $set: { refreshToken: null } });
    }

    // Clear cookies with correct options
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Logout Error]', err);

    // Still clear cookies on error
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return res.status(500).json({ success: false, message: 'Error during logout' });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = req.query.search?.trim() || '';

    const query = search
      ? {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password') // Avoid exposing password hashes
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }), // Optional: newest users first
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users with pagination:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic, userId } = req.body;
    console.log(userId, profilePic)

    const user = await User.findByIdAndUpdate(userId, { profilePic }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile picture updated', user });
  } catch (err) {
    console.error('Error updating profilePic:', err);
    res.status(500).json({ message: 'Server error' });
  }
}


export const deleteProfilePic = async (req, res) => {
  const { filePath, userId } = req.body;

  if (!filePath || !userId) {
    return res.status(400).json({ error: 'Missing filePath or userId' });
  }

  try {
    // Step 1: Delete the file from GCS
    const fileDeleted = await deleteFileFromGCS(filePath);

    if (!fileDeleted) {
      return res.status(500).json({ error: 'Failed to delete file from GCS' });
    }

    // Step 2: Update MongoDB (User) - clear profilePic
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear profile picture field in MongoDB
    user.profilePic = '';
    await user.save();

    return res.status(200).json({ message: 'File deleted and user profile updated successfully' });
  } catch (err) {
    console.error('Error in deleteProfilePic:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// @desc    Get user profile by userId
// @route   GET /auth/profile/:userId
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameters
    console.log(userId)
    const user = await User.findById(userId).select('-password'); // Find user by userId
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // List of fields any user can update
    const allowedFields = ['gender', 'firstName', 'lastName', 'profilePic'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Only allow role update if the current user is an admin
    if (req.body.role !== undefined) {
      if (req.user?.role === 'admin') {
        user.role = req.body.role;
      } else {
        return res.status(403).json({ message: 'Only admins can update roles' });
      }
    }

    await user.save();

    const { password, ...userData } = user.toObject(); // Exclude password
    res.status(200).json({ message: 'Profile updated successfully', user: userData });

  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user by userId
// @route   DELETE /auth/users/:userId
// @access  Private (ideally only admins or the user themselves)

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete profilePic from cloud/server if needed
    if (user.profilePic) {
      // Add logic here if using cloudinary or file system
      // e.g., await cloudinary.v2.uploader.destroy(user.profilePicPublicId)
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};