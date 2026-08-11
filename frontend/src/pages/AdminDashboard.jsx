import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { Plus, X, Calendar, MapPin, Users, Settings, Tag, Image, Clock, FileText, AlertCircle, Sparkles } from 'lucide-react';

const CATEGORIES = ['Workshop', 'Hackathon', 'Symposium', 'Seminar', 'Conference', 'Other'];

const parseTimeRange = (timeStr) => {
  if (!timeStr) return { startTime: '', endTime: '' };
  const convertTo24h = (t) => {
    if (!t) return '';
    const match = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      const match24 = t.trim().match(/(\d+):(\d+)/);
      if (match24) return `${match24[1].padStart(2, '0')}:${match24[2]}`;
      return '';
    }
    let [ , h, m, ampm ] = match;
    h = parseInt(h, 10);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  };
  const parts = timeStr.split('-');
  if (parts.length >= 2) {
    return { startTime: convertTo24h(parts[0]), endTime: convertTo24h(parts[1]) };
  }
  return { startTime: convertTo24h(timeStr), endTime: '' };
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  if (!h || !m) return time24;
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${m} ${ampm}`;
};

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '10:00',
    startAmPm: 'AM',
    endTime: '04:00',
    endAmPm: 'PM',
    venue: '',
    seats: '',
    image: '',
    category: 'Workshop'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem('token');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'create') {
      handleOpenCreate();
      navigate('/admin', { replace: true });
    }
  }, [location, navigate]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '10:00',
      startAmPm: 'AM',
      endTime: '04:00',
      endAmPm: 'PM',
      venue: '',
      seats: '',
      image: '',
      category: 'Workshop'
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    const pStart = parseTimeRange(event.time).startTime;
    const pEnd = parseTimeRange(event.time).endTime;
    const start12 = pStart ? formatTime12h(pStart).split(' ') : ['', 'AM'];
    const end12 = pEnd ? formatTime12h(pEnd).split(' ') : ['', 'PM'];

    setFormData({
      title: event.title,
      description: event.description,
      // Format Date to YYYY-MM-DD for input field
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      startTime: start12[0] || '',
      startAmPm: start12[1] || 'AM',
      endTime: end12[0] || '',
      endAmPm: end12[1] || 'PM',
      venue: event.venue,
      seats: event.totalSeats,
      image: event.image,
      category: event.category
    });
    setImageFile(null);
    if (event.image) {
      setImagePreview(event.image.startsWith('/uploads') ? `http://localhost:5000${event.image}` : event.image);
    } else {
      setImagePreview(null);
    }
    setError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('date', formData.date);
      const timeString = formData.endTime 
        ? `${formData.startTime} ${formData.startAmPm} - ${formData.endTime} ${formData.endAmPm}` 
        : `${formData.startTime} ${formData.startAmPm}`;
      data.append('time', timeString);
      data.append('venue', formData.venue);
      data.append('seats', formData.seats);
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);
      if (imageFile) data.append('imageFile', imageFile);

      if (editingEvent) {
        // Edit request
        await axios.put(
          `http://localhost:5000/api/events/${editingEvent._id}`,
          data,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Create request
        await axios.post(
          'http://localhost:5000/api/events',
          data,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save event details. Please check values.');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove associated registration files.')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Title Header area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
              <Settings className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              Event Operations Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create, update, and manage student registration records
            </p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-505 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Create Event
          </button>
        </div>

        {error && !showModal && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Dashboard Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading event directory...</p>
          </div>
        ) : (
          <div className="mt-10">
            {events.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/25 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm mx-auto">
                <Sparkles className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No events found</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Click the "Create Event" button above to launch your first workshop, hackathon, or seminar!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isAdmin={true}
                    onEdit={handleOpenEdit}
                    onDelete={() => handleDelete(event._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-slate-850 dark:text-white text-lg">
                {editingEvent ? 'Modify Event Details' : 'Launch New Event'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-650 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event Title</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter event name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Provide brief details about targets, schedules, and awards..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white"
                />
              </div>

              {/* Date, Time, Venue grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleFormChange}
                      onClick={(e) => {
                        if (e.target.showPicker) e.target.showPicker();
                      }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white cursor-pointer"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Timing</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center border rounded-xl text-sm glass-input text-slate-800 dark:text-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/50">
                      <Clock className="absolute left-2.5 w-4 h-4 text-slate-400 z-10" />
                      <input
                        type="text"
                        name="startTime"
                        required
                        placeholder="HH:MM"
                        pattern="\d{1,2}:\d{2}"
                        title="Enter time as HH:MM (e.g. 10:30)"
                        value={formData.startTime}
                        onChange={handleFormChange}
                        className="w-full min-w-0 pl-8 pr-1 py-2.5 bg-transparent border-none outline-none focus:ring-0 text-sm"
                      />
                      <select
                        name="startAmPm"
                        value={formData.startAmPm}
                        onChange={handleFormChange}
                        className="bg-transparent border-none outline-none text-sm py-2.5 pr-1 pl-0 focus:ring-0 font-medium cursor-pointer text-slate-700 dark:text-slate-300"
                      >
                        <option value="AM" className="bg-white dark:bg-slate-800">AM</option>
                        <option value="PM" className="bg-white dark:bg-slate-800">PM</option>
                      </select>
                    </div>
                    <span className="text-slate-400 font-medium text-xs">to</span>
                    <div className="relative flex-1 flex items-center border rounded-xl text-sm glass-input text-slate-800 dark:text-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/50">
                      <Clock className="absolute left-2.5 w-4 h-4 text-slate-400 z-10" />
                      <input
                        type="text"
                        name="endTime"
                        required
                        placeholder="HH:MM"
                        pattern="\d{1,2}:\d{2}"
                        title="Enter time as HH:MM (e.g. 02:00)"
                        value={formData.endTime}
                        onChange={handleFormChange}
                        className="w-full min-w-0 pl-8 pr-1 py-2.5 bg-transparent border-none outline-none focus:ring-0 text-sm"
                      />
                      <select
                        name="endAmPm"
                        value={formData.endAmPm}
                        onChange={handleFormChange}
                        className="bg-transparent border-none outline-none text-sm py-2.5 pr-1 pl-0 focus:ring-0 font-medium cursor-pointer text-slate-700 dark:text-slate-300"
                      >
                        <option value="AM" className="bg-white dark:bg-slate-800">AM</option>
                        <option value="PM" className="bg-white dark:bg-slate-800">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Venue Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="text"
                      name="venue"
                      required
                      value={formData.venue}
                      onChange={handleFormChange}
                      placeholder="e.g. Seminar Hall A"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Seats */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Seats</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="number"
                      name="seats"
                      required
                      value={formData.seats}
                      onChange={handleFormChange}
                      placeholder="e.g. 60"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Banner image grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Event Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Banner Image */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Banner Image (Optional)</label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="file"
                      accept="image/*"
                      name="imageFile"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImageFile(file);
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                  </div>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" 
                  />
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-505 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingEvent ? 'Save Changes' : 'Launch Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
