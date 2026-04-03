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

// Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, mobile, language } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Map roles for specific deterministic admin emails securely like Firebase used to
        let role = 'USER';
        if (email === 'admin@schemesarthi.gov.in') role = 'SUPER_ADMIN';
        else if (email === 'content@schemesarthi.gov.in') role = 'CONTENT_ADMIN';
        else if (email === 'reviewer@schemesarthi.gov.in') role = 'REVIEW_ADMIN';

        const user = await User.create({
            firebaseUid: `mongo_${Date.now()}`, // fallback to prevent schema clashes
            email,
            password: hashedPassword,
            fullName,
            mobile,
            role,
            language: language || 'en',
            status: 'active'
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    language: user.language,
                    status: user.status,
                    token: generateToken(user._id),
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        
        // We might be migrating from Firebase where password is NOT in MongoDB
        if (!user.password) {
            return res.status(401).json({ success: false, error: 'Account migrated silently. Please reset your password or sign in with Firebase temporarily if bridging is active.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ success: false, error: 'Your account has been blocked' });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                language: user.language,
                status: user.status,
                token: generateToken(user._id),
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get currently logged in profile (Requires Auth Header Token!)
router.get('/profile', async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
            
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                return res.json({ success: true, data: { ...user._doc, id: user._id } });
            }
        }
        res.status(401).json({ success: false, error: 'Not authorized' });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Token Failed' });
    }
});

export default router;
