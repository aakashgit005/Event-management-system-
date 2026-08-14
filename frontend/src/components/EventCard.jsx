import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const CATEGORY_IMAGES = {
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  Hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
  Symposium: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  Seminar: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60',
  Conference: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60',
  Other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60',
};

const CATEGORY_COLORS = {
  Workshop: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  Hackathon: 'bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
  Symposium: 'bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
  Seminar: 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  Conference: 'bg-pink-50 text-pink-700 border-pink-200/50 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30',
  Other: 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
};

const EventCard = ({ event, isAdmin, onEdit, onDelete }) => {
  let rawImage = (event.image && event.image.trim() !== '') ? event.image : null;
  if (rawImage && rawImage.startsWith('/uploads')) {
    rawImage = 'https://event-management-system-gx6p.onrender.com' + rawImage;
  }
  const imageUrl = rawImage || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Other;
  const isSoldOut = event.seatsAvailable <= 0;
  const isCompleted = event.status === 'completed';
  
  // Seat percentage
  const seatsTaken = event.totalSeats - event.seatsAvailable;
  const percentTaken = event.totalSeats > 0 ? (seatsTaken / event.totalSeats) * 100 : 0;

  let progressColor = 'bg-violet-600';
  if (event.seatsAvailable <= 5) progressColor = 'bg-red-500';
  else if (event.seatsAvailable <= 15) progressColor = 'bg-amber-500';

  return (
    <div className="group relative flex flex-col rounded-3xl overflow-hidden glass-card hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      {/* Event Category Badge & Banner Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
        
        {/* Category Badge */}
        <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${CATEGORY_COLORS[event.category]}`}>
          {event.category}
        </span>

        {/* Completed overlay */}
        {isCompleted && (
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-slate-100 border border-slate-700 backdrop-blur-md uppercase tracking-wider">
            Completed
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Venue / Date indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            {event.venue}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-1">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Seat Tracker Progress Bar */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              {isSoldOut ? (
                <span className="text-red-500 font-semibold">Sold Out</span>
              ) : (
                <span>{event.seatsAvailable} seats left</span>
              )}
            </span>
            <span className="text-slate-400">{event.totalSeats} total</span>
          </div>
          
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, percentTaken)}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2">
          {isAdmin ? (
            <div className="flex gap-2 w-full">
              <Link
                to={`/admin/event/${event._id}`}
                className="flex-1 text-center py-2 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 text-xs font-semibold rounded-xl transition-colors duration-200"
              >
                Registrations
              </Link>
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                Edit
              </button>
            </div>
          ) : (
            <Link
              to={`/event/${event._id}`}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200
                ${isCompleted
                  ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed'
                  : isSoldOut 
                    ? 'bg-red-50 text-red-500 border border-red-100/50 cursor-not-allowed dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30'
                }`}
            >
              {isCompleted ? 'Event Completed' : isSoldOut ? 'Sold Out' : 'View Details & Register'}
              {!isSoldOut && !isCompleted && <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
