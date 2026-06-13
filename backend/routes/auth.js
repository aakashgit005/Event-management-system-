const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforeventflow123';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST api/auth/signup (Participant)
// @desc    Register a new participant user
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, college, department, year } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already registered with this email' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      phone,
      college,
      department,
      year
    });

    await user.save();

    res.status(201).json({
      token: generateToken(user._id, 'user'),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        department: user.department,
        year: user.year,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST api/auth/login (Participant)
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id, 'user'),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        department: user.department,
        year: user.year,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST api/auth/admin/signup (Admin/Organizer)
// @desc    Register a new administrator or organizer user
// @access  Public
router.post('/admin/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Administrator/Organizer already registered with this email' });
    }

    // Create admin
    admin = new Admin({
      email,
      password
    });

    await admin.save();

    res.status(201).json({
      token: generateToken(admin._id, 'admin'),
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin Signup Error:', error.message);
    res.status(500).json({ message: 'Server error during administrator signup' });
  }
});

// @route   POST api/auth/admin/login (Admin)
// @desc    Authenticate admin & get token
// @access  Public
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    res.json({
      token: generateToken(admin._id, 'admin'),
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// @route   GET api/auth/me
// @desc    Get user/admin profile using token
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    if (req.userRole === 'admin') {
      res.json({
        id: req.admin._id,
        email: req.admin.email,
        role: 'admin'
      });
    } else {
      res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        college: req.user.college,
        department: req.user.department,
        year: req.user.year,
        role: 'user'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

module.exports = router;
