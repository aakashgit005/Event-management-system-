const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  seatsAvailable: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Workshop', 'Hackathon', 'Symposium', 'Seminar', 'Conference', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
