import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix for Windows DNS ETIMEOUT on MongoDB Atlas SRV TXT records (Windows only)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    console.warn('DNS server override warning:', e.message);
  }
}

// Routes
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Models for seed check
import User from './models/User.js';
import Lead from './models/Lead.js';
import { runSeed } from './seedData.js';

dotenv.config();

// Ensure JWT_SECRET has a production fallback if not set in cloud environment
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'qevnarocrm_ultra_secure_jwt_secret_key_2026';
  console.log('[QevnaroCRM] Notice: JWT_SECRET environment variable not provided, using secure fallback key.');
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://prakashmishra262005_db_user:cDbuuyjvI8XfQ85U@cluster0.7viuxl4.mongodb.net/qevnarocrm?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'QevnaroCRM API Server',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Database Connection & Auto Seed
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[QevnaroCRM] MongoDB connected successfully.');

    // Ensure admin and default users exist if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[QevnaroCRM] Initializing default users...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`[QevnaroCRM] Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn(`[QevnaroCRM] MongoDB connection warning: ${error.message}`);
    console.log('[QevnaroCRM] Starting server in standalone / frontend proxy mode on port ' + PORT);
    app.listen(PORT, () => {
      console.log(`[QevnaroCRM] Server listening on port ${PORT}`);
    });
  }
};

startServer();
