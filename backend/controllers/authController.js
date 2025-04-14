import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { generateSignedUploadUrl, generateSignedUrl } from '../utils/generateSignedUrl.js';

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

export const getFileUrl = async (req, res) => {
  try {
    const { fileName } = req.body;
    console.log(req.body)

    if (!fileName) {
      return res.status(400).json({ message: 'Missing fileName or fileType' });
    }

    const signedUrl = await generateSignedUrl(fileName);
    
    console.log(signedUrl,"signedUrl")
    return res.status(200).json( signedUrl); 
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const getProfilePicUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    console.log(req.body)

    if (!fileName || !contentType) {
      return res.status(400).json({ message: 'Missing fileName or fileType' });
    }

    const signedUrl = await generateSignedUploadUrl(fileName, contentType); 
    
    console.log(signedUrl,"signedUrl")
    return res.status(200).json( signedUrl); 
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};