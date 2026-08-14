import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import TicketModal from '../components/TicketModal';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, AlertCircle, BookmarkCheck, ArrowRight, Award } from 'lucide-react';

const CATEGORY_IMAGES = {
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop',
  Hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop',
  Symposium: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop',
  Seminar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1000&auto=format&fit=crop',
  Conference: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1000&auto=format&fit=crop',
  Other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop',
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Registration States
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationDetail, setRegistrationDetail] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isUserAdmin = token && user && user.role === 'admin';
  const isUserParticipant = token && user && user.role === 'user';

  // Form Fields for review (Pre-filled from logged-in user profile)
  const [formReview, setFormReview] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: ''
  });

  useEffect(() => {
    if (user && isUserParticipant) {
      setFormReview({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        department: user.department || '',
        year: user.year || ''
      });
    }
  }, [token]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      // Fetch Event details
      const eventRes = await axios.get(`https://event-management-system-gx6p.onrender.com/api/events/${id}`);
      setEvent(eventRes.data);

      // Check if participant is logged in and already registered for this event
      if (token && user && user.role === 'user') {
        const regRes = await axios.get('https://event-management-system-gx6p.onrender.com/api/registrations/my-registrations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reg = regRes.data.find(r => r.eventId._id === id || r.eventId === id);
        if (reg) {
          setIsRegistered(true);
          setRegistrationDetail(reg);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Event not found or server error. Please return to Home page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id, token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setError('');

    try {
      const response = await axios.post(
        'https://event-management-system-gx6p.onrender.com/api/registrations',
        { eventId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Confetti burst!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setIsRegistered(true);
      setRegistrationDetail(response.data.registration);
      setShowConfirmForm(false);
      
      // Refresh event details to update seats remaining
      fetchEventData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete registration. Try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl max-w-sm shadow-xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Error Loading Event</h3>
          <p className="text-xs text-slate-450 mt-2">{error}</p>
          <Link to="/" className="mt-6 inline-block px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let rawImage = (event.image && event.image.trim() !== '') ? event.image : null;
  if (rawImage && rawImage.startsWith('/uploads')) {
    rawImage = 'https://event-management-system-gx6p.onrender.com' + rawImage;
  }
  const imageUrl = rawImage || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Other;
  const isSoldOut = event.seatsAvailable <= 0;
  const isCompleted = event.status === 'completed';
  const seatsTaken = event.totalSeats - event.seatsAvailable;
  const percentTaken = event.totalSeats > 0 ? (seatsTaken / event.totalSeats) * 100 : 0;

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute top-6 left-6 md:left-12">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 p-8 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl space-y-8">
          <div>
            <span className="px-3.5 py-1 text-xs font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-250/20 rounded-full uppercase tracking-wider">
              {event.category}
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Quick Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(event.date).toDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
              <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Time</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
              <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Venue</p>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 truncate max-w-[150px]">
                  {event.venue}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">About the Event</h3>
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Registration Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 pb-4 border-b border-slate-100 dark:border-slate-850 mb-4">
              Registration Pass
            </h3>

            {/* Pricing details */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-500">Ticket Type</span>
              <span className="text-2xl font-extrabold text-emerald-500">FREE ENTRY</span>
            </div>

            {/* Capacity tracker */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  {isSoldOut ? 'Sold Out' : `${event.seatsAvailable} seats remaining`}
                </span>
                <span>{event.totalSeats} total</span>
              </div>
              <div className="w-full h-2 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${event.seatsAvailable <= 5 ? 'bg-red-500' : 'bg-violet-600'}`}
                  style={{ width: `${percentTaken}%` }}
                />
              </div>
            </div>

            {/* Server alerts */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200/50 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action flow based on role */}
            {isUserAdmin ? (
              <div className="space-y-3">
                <p className="text-xs text-center text-slate-400">You are logged in as Administrator</p>
                <Link
                  to={`/admin/event/${event._id}`}
                  className="w-full text-center flex items-center justify-center gap-1.5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/20"
                >
                  Manage Registrations
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : isRegistered ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250/20 rounded-xl text-xs font-bold">
                  <BookmarkCheck className="w-4.5 h-4.5" />
                  Registered successfully!
                </div>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="w-full text-center py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/20"
                >
                  View Entry Pass
                </button>
              </div>
            ) : isCompleted ? (
              <button disabled className="w-full py-3 bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-2xl text-xs font-bold cursor-not-allowed uppercase tracking-wider">
                Event Completed
              </button>
            ) : isSoldOut ? (
              <button disabled className="w-full py-3 bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/30 cursor-not-allowed uppercase tracking-wider">
                Sold Out
              </button>
            ) : !token ? (
              <Link
                to="/login"
                className="w-full text-center flex items-center justify-center gap-1.5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold shadow-md"
              >
                Sign In to Register
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : showConfirmForm ? (
              /* Review profile details before confirming */
              <div className="space-y-4 animate-fade-in border-t border-slate-100 dark:border-slate-850 pt-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Review Registration Profile</p>
                  <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Name:</strong> {formReview.name}</p>
                  <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Email:</strong> {formReview.email}</p>
                  <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Phone:</strong> {formReview.phone}</p>
                  <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">College:</strong> {formReview.college}</p>
                  <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Department:</strong> {formReview.department} ({formReview.year})</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmForm(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md disabled:bg-violet-650 flex items-center justify-center"
                  >
                    {registering ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmForm(true)}
                className="w-full text-center py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20"
              >
                Register Now
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Ticket Modal overlay */}
      {showTicketModal && registrationDetail && (
        <TicketModal
          registration={registrationDetail}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};

export default EventDetails;
