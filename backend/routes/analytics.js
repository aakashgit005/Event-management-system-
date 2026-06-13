const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { adminProtect } = require('../middleware/auth');

// @route   GET api/analytics/summary
// @desc    Get dashboard metrics summary (Admin)
// @access  Private (Admin)
router.get('/summary', adminProtect, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalPresent = await Registration.countDocuments({ attendanceStatus: 'Present' });

    // Calculate attendance percentage
    const attendancePercentage = totalRegistrations > 0 
      ? Math.round((totalPresent / totalRegistrations) * 100) 
      : 0;

    // Find the most popular event (highest registration count)
    const popularEventAgg = await Registration.aggregate([
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: '$event' }
    ]);

    const popularEvent = popularEventAgg.length > 0 
      ? { title: popularEventAgg[0].event.title, registrationsCount: popularEventAgg[0].count }
      : { title: 'No registrations yet', registrationsCount: 0 };

    // Get event wise statistics
    const allEvents = await Event.find().sort({ date: 1 });
    const regStats = await Registration.aggregate([
      {
        $group: {
          _id: '$eventId',
          registrations: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$attendanceStatus', 'Present'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = {};
    regStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });

    const eventwiseData = allEvents.map(evt => {
      const stat = statsMap[evt._id.toString()] || { registrations: 0, present: 0 };
      return {
        id: evt._id,
        title: evt.title,
        category: evt.category,
        date: evt.date,
        totalSeats: evt.totalSeats,
        seatsAvailable: evt.seatsAvailable,
        registrations: stat.registrations,
        present: stat.present,
        absent: stat.registrations - stat.present,
        attendanceRate: stat.registrations > 0 ? Math.round((stat.present / stat.registrations) * 100) : 0
      };
    });

    // Category breakdown
    const categoryBreakdown = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0
        }
      }
    ]);

    res.json({
      summary: {
        totalEvents,
        totalRegistrations,
        totalPresent,
        attendancePercentage,
        popularEvent
      },
      eventwiseData,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error generating analytics summary:', error.message);
    res.status(500).json({ message: 'Server error generating analytics data' });
  }
});

module.exports = router;
