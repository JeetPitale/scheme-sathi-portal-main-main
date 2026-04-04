import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT Target
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
        expiresIn: '30d',
    });
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
            req.user = await User.findById(decoded.id);
            if (req.user) return next();
        }
        res.status(401).json({ success: false, error: 'Not authorized' });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Token Failed' });
    }
};

// --- PUBLIC ROUTES ---

// Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, mobile, language } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Map admin roles based on specific emails
        let role = 'USER';
        if (email === 'admin@schemesarthi.gov.in') role = 'SUPER_ADMIN';
        else if (email === 'content@schemesarthi.gov.in') role = 'CONTENT_ADMIN';
        else if (email === 'reviewer@schemesarthi.gov.in') role = 'REVIEW_ADMIN';

        const user = await User.create({
            email, password: hashedPassword, fullName, mobile, role,
            language: language || 'en', status: 'active'
        });

        res.status(201).json({
            success: true,
            data: { id: user._id, email, fullName, role, language: user.language, status: user.status, token: generateToken(user._id) }
        });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        if (user.status === 'blocked') return res.status(403).json({ success: false, error: 'Your account has been blocked' });

        res.json({
            success: true,
            data: { id: user._id, email, fullName: user.fullName, role: user.role, language: user.language, status: user.status, token: generateToken(user._id) }
        });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// --- PROTECTED ROUTES ---

// Get currently logged in profile
router.get('/profile', authenticateToken, async (req, res) => {
    res.json({ success: true, data: { ...req.user._doc, id: req.user._id } });
});

// Get all users (Admin Only)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        if (!['SUPER_ADMIN', 'CONTENT_ADMIN', 'REVIEW_ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Not authorized for this action' });
        }
        // Return all EXCEPT yourself
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        const formatted = users.map(u => ({ ...u._doc, id: u._id }));
        res.json({ success: true, data: formatted });
    } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch users' }); }
});

// Toggle Status (Super Admin Only)
router.put('/users/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: 'Only Super Admin can change status' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        user.status = user.status === 'active' ? 'blocked' : 'active';
        await user.save();
        res.json({ success: true, status: user.status });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;
