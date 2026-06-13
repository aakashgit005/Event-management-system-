const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforeventflow123');

      if (decoded.role === 'admin') {
        req.admin = await Admin.findById(decoded.id).select('-password');
        req.userRole = 'admin';
        if (!req.admin) {
          return res.status(401).json({ message: 'Not authorized, admin user not found' });
        }
      } else if (decoded.role === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
        req.userRole = 'user';
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, participant user not found' });
        }
      } else {
        return res.status(401).json({ message: 'Not authorized, invalid role' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminProtect = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.userRole === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
  });
};

module.exports = {
  protect,
  adminProtect
};
