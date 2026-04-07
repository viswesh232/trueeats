const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Protection Middleware (Must be logged in)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (but don't send the password)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            res.status(411).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(411).json({ message: 'Not authorized, no token' });
    }
};

// 2. Admin Middleware (Must have Admin role)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};



module.exports = { protect, admin };