import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
      algorithm: 'HS256',
    });
  } catch (error) {
    console.error('Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (userId) => {
  try {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
      algorithm: 'HS256',
    });
  } catch (error) {
    console.error('Error generating refresh token:', error.message);
    throw new Error('Failed to generate refresh token');
  }
};
