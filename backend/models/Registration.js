const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String, // Base64 image data or URL
    required: true
  },
  attendanceStatus: {
    type: String,
    enum: ['Absent', 'Present'],
    default: 'Absent'
  }
}, { timestamps: true });

// Prevent double registration for the same event
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
