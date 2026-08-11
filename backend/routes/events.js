const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { adminProtect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// @route   GET api/events
// @desc    Get all events (public) with search/filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter (upcoming/completed)
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// @route   GET api/events/:id
// @desc    Get event details by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error fetching event details' });
  }
});

// @route   POST api/events
// @desc    Create new event (Admin)
// @access  Private (Admin)
router.post('/', adminProtect, upload.single('imageFile'), async (req, res) => {
  const { title, description, date, time, venue, seats, category } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = '/uploads/' + req.file.filename;
  }

  try {
    const totalSeats = parseInt(seats) || 0;
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      venue,
      totalSeats,
      seatsAvailable: totalSeats,
      image,
      category,
      status: 'upcoming'
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// @route   PUT api/events/:id
// @desc    Update an event (Admin)
// @access  Private (Admin)
router.put('/:id', adminProtect, upload.single('imageFile'), async (req, res) => {
  const { title, description, date, time, venue, seats, category, status } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = '/uploads/' + req.file.filename;
  }

  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Adjust seats available if capacity is updated
    if (seats !== undefined) {
      const newTotal = parseInt(seats) || 0;
      const registeredCount = event.totalSeats - event.seatsAvailable;
      event.totalSeats = newTotal;
      event.seatsAvailable = Math.max(0, newTotal - registeredCount);
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (image !== undefined) event.image = image;
    if (category) event.category = category;
    if (status) event.status = status;

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// @route   DELETE api/events/:id
// @desc    Delete an event (Admin)
// @access  Private (Admin)
router.delete('/:id', adminProtect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    console.error('Error deleting event:', error.message);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

module.exports = router;
