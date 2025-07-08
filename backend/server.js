const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const applicationRoutes = require('./routes/application');
const notificationRoutes = require('./routes/notification');
const servicesRoutes = require('./routes/services');
const uploadRoutes = require('./routes/upload');

const announcementRoutes = require('./routes/announcement');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }
});

// Make io accessible in controllers
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });
});

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except health check
app.use('/api', limiter);

// Skip rate limiting for health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Digital E Gram Panchayat API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// CORS configuration
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/announcements', announcementRoutes);




// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`Server started on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  console.log('❌ Unhandled Promise Rejection. Shutting down...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.log('❌ Uncaught Exception. Shutting down...');
  process.exit(1);
});

module.exports = app;