const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { protect, adminProtect } = require('../middleware/auth');
const { sendRegistrationEmail, sendCertificateEmail } = require('../utils/mailer');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

// @route   POST api/registrations
// @desc    Register for an event (Participant)
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id;

  try {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is completed
    if (event.status === 'completed') {
      return res.status(400).json({ message: 'Cannot register for a completed event' });
    }

    // Check if seats are available
    if (event.seatsAvailable <= 0) {
      return res.status(400).json({ message: 'No seats available for this event' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ userId, eventId });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    // Generate Temporary ID for QR code payload before saving
    const tempRegistrationId = new mongoose.Types.ObjectId();

    // Create QR Code payload
    const qrPayload = JSON.stringify({
      registrationId: tempRegistrationId.toString(),
      eventId: eventId.toString(),
      userId: userId.toString()
    });

    // Generate QR code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    // Create Registration
    const registration = new Registration({
      _id: tempRegistrationId,
      userId,
      eventId,
      qrCode: qrCodeDataUrl,
      attendanceStatus: 'Absent'
    });

    // Save registration & decrement available seats
    await registration.save();
    
    event.seatsAvailable = event.seatsAvailable - 1;
    await event.save();

    // Send confirmation email
    try {
      await sendRegistrationEmail(
        req.user.email,
        req.user.name,
        event.title,
        event.date,
        event.venue,
        qrCodeDataUrl,
        registration._id
      );
    } catch (emailErr) {
      console.error('SMTP Email service error, skipping sending email:', emailErr.message);
    }

    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET api/registrations/my-registrations
// @desc    Get logged-in participant's registration history
// @access  Private (User)
router.get('/my-registrations', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching participant registrations:', error.message);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// @route   GET api/registrations/event/:eventId
// @desc    Get all registrations for a specific event (Admin)
// @access  Private (Admin)
router.get('/event/:eventId', adminProtect, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('userId', 'name email phone college department year')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error.message);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
});

// @route   POST api/registrations/verify-qr
// @desc    Verify QR Code payload and mark attendance (Admin)
// @access  Private (Admin)
router.post('/verify-qr', adminProtect, async (req, res) => {
  const { registrationId, eventId } = req.body;

  try {
    const registration = await Registration.findById(registrationId)
      .populate('userId', 'name email phone college department year')
      .populate('eventId', 'title date venue status');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid ticket. Registration not found.' });
    }

    // Verify it is for the correct event
    if (registration.eventId._id.toString() !== eventId) {
      return res.status(400).json({ message: 'Ticket does not belong to this event' });
    }

    if (registration.attendanceStatus === 'Present') {
      return res.status(200).json({ 
        message: 'Attendance already marked as Present', 
        alreadyMarked: true,
        registration 
      });
    }

    // Update attendance
    registration.attendanceStatus = 'Present';
    await registration.save();

    res.status(200).json({
      message: 'Attendance marked successfully',
      alreadyMarked: false,
      registration
    });
  } catch (error) {
    console.error('Error verifying QR code:', error.message);
    res.status(500).json({ message: 'Server error verifying ticket' });
  }
});

// @route   POST api/registrations/issue-certificates/:eventId
// @desc    Generate certificates and email them to present participants (Admin)
// @access  Private (Admin)
router.post('/issue-certificates/:eventId', adminProtect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all registrations marked as Present
    const attendees = await Registration.find({
      eventId: req.params.eventId,
      attendanceStatus: 'Present'
    }).populate('userId', 'name email college');

    if (attendees.length === 0) {
      return res.status(400).json({ message: 'No attendees marked as Present for this event' });
    }

    let issuedCount = 0;

    for (const attendee of attendees) {
      // Check if certificate already exists
      let cert = await Certificate.findOne({ registrationId: attendee._id });
      if (!cert) {
        // Create Certificate entry
        cert = new Certificate({
          registrationId: attendee._id,
          certificateUrl: `/api/registrations/certificate/${attendee._id}` // Dynamic endpoint path
        });
        await cert.save();
      }

      // Generate PDF in memory
      const pdfBuffer = await generateCertificatePDF(
        attendee.userId.name,
        event.title,
        event.date,
        attendee.userId.college,
        attendee._id.toString()
      );

      // Email PDF certificate
      try {
        await sendCertificateEmail(attendee.userId.email, attendee.userId.name, event.title, pdfBuffer);
        issuedCount++;
      } catch (emailErr) {
        console.error(`Failed to send certificate email to ${attendee.userId.email}:`, emailErr.message);
      }
    }

    // Update event status to completed
    event.status = 'completed';
    await event.save();

    res.json({
      message: `Certificates processing complete. Issued and emailed ${issuedCount} certificates.`,
      issuedCount
    });
  } catch (error) {
    console.error('Error issuing certificates:', error.message);
    res.status(500).json({ message: 'Server error issuing certificates' });
  }
});

// @route   GET api/registrations/certificate/:registrationId
// @desc    Download/Stream Certificate PDF (Public/Participant)
// @access  Public (so users can download via direct links)
router.get('/certificate/:registrationId', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('userId', 'name email college')
      .populate('eventId', 'title date');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.attendanceStatus !== 'Present') {
      return res.status(403).json({ message: 'Certificate only available to attendees marked as Present.' });
    }

    // Optional: check if certificate is logged in DB, if not register it
    let cert = await Certificate.findOne({ registrationId: registration._id });
    if (!cert) {
      cert = new Certificate({
        registrationId: registration._id,
        certificateUrl: `/api/registrations/certificate/${registration._id}`
      });
      await cert.save();
    }

    // Generate PDF on the fly
    const pdfBuffer = await generateCertificatePDF(
      registration.userId.name,
      registration.eventId.title,
      registration.eventId.date,
      registration.userId.college,
      registration._id.toString()
    );

    // Set headers and stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Certificate_${registration.eventId.title.replace(/\s+/g, '_')}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating streaming PDF:', error.message);
    res.status(500).send('Server error generating certificate');
  }
});

// @route   PUT api/registrations/:registrationId/attendance
// @desc    Manually update attendance status (Admin)
// @access  Private (Admin)
router.put('/:registrationId/attendance', adminProtect, async (req, res) => {
  const { status } = req.body;

  if (!['Present', 'Absent'].includes(status)) {
    return res.status(400).json({ message: 'Invalid attendance status' });
  }

  try {
    const registration = await Registration.findById(req.params.registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.attendanceStatus = status;
    await registration.save();

    res.json({ message: 'Attendance status updated successfully', registration });
  } catch (error) {
    console.error('Error manually updating attendance:', error.message);
    res.status(500).json({ message: 'Server error updating attendance' });
  }
});

module.exports = router;
