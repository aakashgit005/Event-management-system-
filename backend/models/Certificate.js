const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true
  },
  certificateUrl: {
    type: String, // Can store base64 string or file path
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
