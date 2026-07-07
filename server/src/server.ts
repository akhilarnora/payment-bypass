import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import paymentRoutes from './routes/payment.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Establish Database Connection
connectDB();

// 2. Enable CORS with allowed origins
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Endpoints Configuration
app.use('/api/payment', paymentRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Razorpay Payment backend is running',
    timestamp: new Date().toISOString(),
    env: {
      PORT: process.env.PORT || 'not defined',
      MONGODB_URI: process.env.MONGODB_URI || 'not defined',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'not defined',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || 'not defined',
      CLIENT_URL: process.env.CLIENT_URL || 'not defined',
      NODE_ENV: process.env.NODE_ENV || 'not defined',
    },
  });
});

// Fallback for unknown API routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find route ${req.originalUrl} on this server.`,
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

// 6. Start the Express Listener
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
