import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import LightRays from '../components/LightRays';
import { Search, SlidersHorizontal, BookOpen, Laptop, Milestone, GraduationCap, Award, Compass, RefreshCw } from 'lucide-react';

const CATEGORIES = ['All', 'Workshop', 'Hackathon', 'Symposium', 'Seminar', 'Conference'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/events', {
        params: {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          status: 'upcoming' // Display active upcoming events first
        }
      });
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-violet-600/10 via-slate-50 to-slate-50 dark:from-violet-950/20 dark:via-slate-950 dark:to-slate-950">
        {/* LightRays WebGL background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60 pointer-events-none" style={{ zIndex: 0 }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#7c3aed"
            raysSpeed={0.8}
            lightSpread={0.7}
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.12}
            noiseAmount={0.05}
            distortion={0.03}
            pulsating={true}
            fadeDistance={1.2}
            saturation={1.0}
          />
        </div>
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-[100px]" style={{ zIndex: 1 }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative" style={{ zIndex: 2 }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border border-violet-200/30 dark:border-violet-900/30 rounded-full text-xs font-bold uppercase tracking-wider animate-fade-in">
            <Compass className="w-3.5 h-3.5" />
            Empower Your College Experience
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white max-w-4xl mx-auto leading-[1.15] animate-fade-in">
            Discover and Register for the Ultimate <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">College Events</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            EventFlow simplifies registrations for workshops, hackathons, symposiums, and conferences. Track your tickets with instant QR entry cards and certificates.
          </p>

          {/* Core Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-slate-850 dark:text-slate-100">
            <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/55 dark:border-slate-800/40 rounded-2xl">
              <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">20+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Active Programs</p>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/55 dark:border-slate-800/40 rounded-2xl">
              <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">10k+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Registrations</p>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/55 dark:border-slate-800/40 rounded-2xl">
              <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">99%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Attendance Rate</p>
            </div>
            <div className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/55 dark:border-slate-800/40 rounded-2xl">
              <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Certified Paths</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Browse Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Search and Filter bar */}
        <div className="p-4 rounded-3xl glass-card border border-slate-200/60 dark:border-slate-800/80 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm glass-input text-slate-850 dark:text-white"
            />
          </div>

          {/* Categories Horizontal Scrolling */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0 hidden lg:block" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 border
                  ${category === cat
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
                    : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-8 text-center p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading upcoming events...</p>
          </div>
        ) : (
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              Upcoming Events
              <span className="text-xs px-2 py-0.5 font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {events.length}
              </span>
            </h2>

            {/* Empty state */}
            {events.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/25 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md mx-auto">
                <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">No events found</h3>
                <p className="text-xs text-slate-400 mt-2">
                  We couldn't find any events matching your search criteria. Try looking for another category or check back later!
                </p>
              </div>
            ) : (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} isAdmin={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
