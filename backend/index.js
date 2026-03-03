import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
// import xss from 'xss-clean'; // Removed: Incompatible with Express 5 getters
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import 'dotenv/config';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import { stripeWebhook } from './controllers/billingController.js';
import adminRoutes from './routes/adminRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import consultationRoutes from './routes/consultation.js';
import staffRoutes from './routes/staffRoutes.js';
import redis from './config/redis.js';

// Connect DBs
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */

// CORS (FIRST)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
app.use(morgan('dev'));

// 1. Stripe webhook (MUST be before express.json() and at the specific root path)
app.post('/api/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Required for Twilio webhook POST bodies
app.use(cookieParser());

// Mongo sanitize REMOVED to fix getter property crash
// app.use(
//   mongoSanitize({
//     replaceWith: '_',
//     sanitizeQuery: false, // 🔑 prevents req.query crash
//   })
// );

// Security headers (Helmet sets various HTTP headers to protect against common attacks)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// XSS protection (REMOVED: xss-clean is incompatible with Express 5 req.query)
// app.use(xss());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Optional request logger (Removed as per user request to silence terminal)
/*
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }
  next();
});
*/

/* =========================
   ROUTES
========================= */

app.get('/api/stats', (req, res) => {
  res.json({
    heart_rate: 72 + Math.floor(Math.random() * 10),
    status: 'Healthy Flow',
    active_doctors: 12,
    total_patients: 1540
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/staff', staffRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareSync Backend is running' });
});

// ML health check
app.get('/api/ml-health', (req, res) => {
  res.json({ status: 'ok', service: 'ML Service not implemented yet' });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
