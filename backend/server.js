const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development, can be tightened for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Seed Default Admin if none exists
const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('No admin users found. Seeding default admin account...');
      const defaultAdmin = new Admin({
        email: 'admin@eventflow.com',
        password: 'admin123' // Will be hashed by pre-save hook
      });
      await defaultAdmin.save();
      console.log('--------------------------------------------------');
      console.log('Default Admin Account Created Successfully:');
      console.log('Email: admin@eventflow.com');
      console.log('Password: admin123');
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};
seedDefaultAdmin();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/analytics', require('./routes/analytics'));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Event Registration and Management API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in production-ready mode on port ${PORT}`);
});
