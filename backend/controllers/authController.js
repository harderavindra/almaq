import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

// @desc   Register new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const profilePic = req.file ? req.file.path : '';

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ name, email, password, role, profilePic });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
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
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res
    .cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 mins
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user?.profilePic,
    });
};



export const refreshToken = async (req, res) => {
  const refresh = req.cookies.refreshToken;
  if (!refresh) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token')
    .clearCookie('refreshToken')
    .json({ message: 'Logged out successfully' });
};



export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(users);
};


export const uploadProfilePic = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    console.log(req.user.id)
    const user = await User.findById(req.user.id); // Assuming user is stored in req.user after authentication
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old profile pic if it exists
    if (user.profilePic) {
      const oldPicPath = path.join(__dirname, '../uploads/', user.profilePic);
      // You can delete the old file here if necessary using fs.unlinkSync(oldPicPath)
    }

    // Save the new profile pic path to the user model
    user.profilePic = `uploads/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', profilePic: user.profilePic });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Handle Profile Pic Deletion
export const deleteProfilePic = async (req, res) => {
  try {
    // Find the user from the database
    const user = await User.findById(req.user.id); // Assuming user is stored in req.user after authentication
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if there is a profile pic to delete
    if (user.profilePic) {
      // Construct the file path for the profile picture
      const picPath = path.join(__dirname, '../', user.profilePic);

      // Check if the file exists before trying to delete it
      fs.access(picPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('Profile pic not found:', err);
          return res.status(404).json({ message: 'Profile picture not found' });
        }

        // Delete the file from the filesystem
        fs.unlinkSync(picPath);
        console.log('Profile picture deleted successfully!');

        // Remove the profile picture path from the user's record
        user.profilePic = null;
        user.save();

        res.json({ message: 'Profile picture deleted successfully' });
      });
    } else {
      res.status(400).json({ message: 'No profile picture to delete' });
    }
  } catch (err) {
    console.error('Error deleting profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};