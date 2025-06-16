import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware: Protect routes with JWT
export const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;


    if (authHeader?.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(`[Auth Error] ${error.name}: ${error.message}`);
        const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Token invalid';
        return res.status(401).json({ success: false, message });
    }
};

// Middleware: Admin-only
export const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Not authorized as admin' });
};

// Middleware: Delivery manager-only
export const isDeliveryManager = (req, res, next) => {
    if (req.user?.role === 'delivery-manager') {
        return next();
    }
    res.status(403).json({ message: 'Not authorized as delivery manager' });
};

// Middleware: Reusable role checker
export const checkRole = (role) => (req, res, next) => {
    if (req.user?.role === role) {
        return next();
    }
    res.status(403).json({ message: `Not authorized as ${role}` });
};
