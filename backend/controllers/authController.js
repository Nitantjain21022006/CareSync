import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthLog from '../models/AuthLog.js';
import DoctorPatient from '../models/DoctorPatient.js';
import fs from 'fs';
import path from 'path';
import { sendEmail, sendOTPEmail, sendResetPasswordEmail } from '../utils/email.js';

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (1 hour)
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendResetPasswordEmail(user.email, resetUrl);

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

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

// @desc    Request Signup OTP
// @route   POST /api/auth/request-signup-otp
// @access  Public
export const requestSignupOTP = async (req, res, next) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ success: false, error: 'User already exists and is verified' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 600000; // 10 minutes

        // Store OTP in the User model but keep it as isVerified: false.
        if (!user) {
            user = new User({
                email,
                password: 'placeholder_password_' + Date.now(), // temporary
                fullName: 'Pending Verification',
                role: 'patient',
                isVerified: false
            });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTPEmail(email, otp);

        res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
        console.error('Request OTP Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const register = async (req, res, next) => {
    const { email, password, fullName, role, phone, metadata, otp } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Update user with real data
        user.password = password;
        user.fullName = fullName;
        user.role = role || 'patient';
        user.phone = phone;
        user.metadata = metadata || {};
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

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
            console.log(`Login failure: User not found with email ${email}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failure: Password mismatch for user ${email}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (role && user.role !== role) {
            console.log(`Login failure: Role mismatch for user ${email}. Expected ${role}, found ${user.role}`);
            return res.status(403).json({ success: false, error: `Unauthorized role: ${role}` });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Account not verified. Please verify your email before logging in.',
                email: user.email // Provide email for resend UI
            });
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
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const { fullName, phone, metadata } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (metadata) {
            user.metadata = { ...user.metadata, ...metadata };
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add a doctor (Patient)
// @route   POST /api/auth/add-doctor
// @access  Private (Patient)
// @desc    Upload profile photo
// @route   PUT /api/auth/profile-photo
// @access  Private
export const uploadProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Delete old photo if exists and is not the default
        if (user.profilePhoto && fs.existsSync(user.profilePhoto)) {
            // Optional: You might want to skip deleting if it's a shared default
            // For now, let's just delete it to save space
            // fs.unlinkSync(user.profilePhoto); 
        }

        user.profilePhoto = `uploads/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Upload Profile Photo Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export const addDoctor = async (req, res, next) => {
    try {
        const { doctorId } = req.body;
        const patientId = req.user.id;

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            return res.status(404).json({ success: false, error: 'Doctor not found' });
        }

        const existingLink = await DoctorPatient.findOne({ doctor: doctorId, patient: patientId });
        if (existingLink) {
            return res.status(400).json({ success: false, error: 'Doctor already added' });
        }

        await DoctorPatient.create({
            doctor: doctorId,
            patient: patientId
        });

        // Notify Doctor
        const patient = await User.findById(patientId);
        const subject = 'New Patient Added - CareSync';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2D7D6F;">New Patient Added</h2>
                <p>Hello Dr. ${doctor.fullName},</p>
                <p>A new patient, <strong>${patient.fullName}</strong>, has added you to their care team.</p>
                <p>A patient folder has been created in your dashboard for clinical record management.</p>
                <a href="${process.env.FRONTEND_URL}/dashboard/doctor" style="background: #1A202C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
            </div>
        `;

        try {
            await sendEmail(doctor.email, subject, htmlContent);
        } catch (err) {
            console.error('Email notification to doctor failed');
        }

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully'
        });
    } catch (err) {
        console.error('Add Doctor Error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
