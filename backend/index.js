import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

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
import chatRoutes from './routes/chatRoutes.js';
import redis from './config/redis.js';
import Message from './models/Message.js';
import User from './models/User.js';

// Connect DBs
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

/* =========================
   SOCKET.IO SETUP
========================= */

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Map userId -> Set of socket IDs (a user can have multiple tabs open)
const onlineUsers = new Map();

// Socket.io JWT auth middleware
io.use(async (socket, next) => {
  try {
    let token;

    // Try cookie first
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.token;
    }

    // Fallback: auth header
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error('Authentication error: no token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error: user not found'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();

  // Register user in online map
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Broadcast updated online list
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));

  // --- Send Message ---
  socket.on('sendMessage', async ({ receiverId, content }) => {
    if (!receiverId || !content?.trim()) return;

    try {
      const message = await Message.create({
        sender: userId,
        receiver: receiverId,
        content: content.trim(),
      });

      const populated = await message.populate([
        { path: 'sender', select: 'fullName profilePhoto' },
        { path: 'receiver', select: 'fullName profilePhoto' },
      ]);

      // Emit to receiver if online (all their sockets)
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach((sid) => {
          io.to(sid).emit('newMessage', populated);
        });
      }

      // Confirm back to sender
      socket.emit('messageSent', populated);
    } catch (err) {
      console.error('sendMessage error:', err);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // --- Typing indicators ---
  socket.on('typing', ({ receiverId }) => {
    const receiverSockets = onlineUsers.get(receiverId);
    if (receiverSockets) {
      receiverSockets.forEach((sid) => {
        io.to(sid).emit('userTyping', { senderId: userId });
      });
    }
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSockets = onlineUsers.get(receiverId);
    if (receiverSockets) {
      receiverSockets.forEach((sid) => {
        io.to(sid).emit('userStopTyping', { senderId: userId });
      });
    }
  });

  // --- Disconnect ---
  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});


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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  })
);


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
app.use('/api/chat', chatRoutes);

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

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
