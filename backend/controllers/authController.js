import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';

// Helper to set cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    user.password = undefined; // Remove password from response

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user
        });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const register = async (req, res, next) => {
    const { email, password, fullName, role, phone, metadata } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        user = await User.create({
            email,
            password,
            fullName,
            role: role || 'patient',
            phone,
            metadata: metadata || {}
        });

        // Log the signup event
        await AuthLog.create({
            userId: user._id,
            email: user.email,
            eventType: 'signup'
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ success: false, error: `Unauthorized role: ${role}` });
        }

        // Log login
        await AuthLog.create({
            userId: user._id,
            email: user.email,
            eventType: 'login'
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all doctors
// @route   GET /api/auth/doctors
// @access  Private
export const getDoctors = async (req, res, next) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('fullName email phone metadata');
        res.status(200).json({ success: true, count: doctors.length, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all patients
// @route   GET /api/auth/patients
// @access  Private (Doctor)
export const getPatients = async (req, res, next) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('fullName email phone metadata');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
