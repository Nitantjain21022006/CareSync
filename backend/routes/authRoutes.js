import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Signup Route
router.post('/signup', async (req, res) => {
    const { email, password, metadata } = req.body;
    console.log('MongoDB Signup attempt:', email);

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            fullName: metadata?.fullName || email,
            role: metadata?.role || 'patient', // Default to patient
            phone: metadata?.phone || '',
            metadata: metadata || {}
        });

        await user.save();
        console.log('MongoDB Signup success:', user._id);

        // Log the signup event
        const log = new AuthLog({
            userId: user._id,
            email: user.email,
            eventType: 'signup'
        });
        await log.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            }
        });
    } catch (err) {
        console.error('Internal Error during MongoDB signup:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    console.log(`MongoDB Login attempt: ${email} as ${role}`);

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify role if provided
        if (role && user.role !== role) {
            return res.status(403).json({ error: `Unauthorized: User is registered as ${user.role}, not ${role}` });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        console.log('MongoDB Login success:', user._id);

        // Log the login event
        const log = new AuthLog({
            userId: user._id,
            email: user.email,
            eventType: 'login'
        });
        await log.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                profile: user // Returning full user as profile
            }
        });
    } catch (err) {
        console.error('Internal Error during MongoDB login:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Current User Profile (Protected)
router.get('/me', authenticate, async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Profile by ID
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.status(200).json({ data: user });
    } catch (err) {
        console.error('Internal Error fetching MongoDB profile:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Logout Route (Stateless JWT - just send success)
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
