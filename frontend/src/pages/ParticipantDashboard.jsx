import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketModal from '../components/TicketModal';
import { Calendar, MapPin, Clock, Download, Ticket, Award, BookOpen, School, Phone, Mail, UserCheck } from 'lucide-react';

const ParticipantDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedReg, setSelectedReg] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://event-management-system-gx6p.onrender.com/api/registrations/my-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch registration history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [token]);

  // Download PDF certificate on click
  const handleDownloadCertificate = async (regId, eventTitle) => {
    try {
      // Trigger streaming download by opening the route in a new tab/window or direct fetch
      window.open(`https://event-management-system-gx6p.onrender.com/api/registrations/certificate/${regId}`, '_blank');
    } catch (error) {
      console.error('Failed to download certificate:', error);
      alert('Could not download certificate. Make sure you were marked as Present.');
    }
  };

  // Filter registrations into upcoming and completed
  const upcomingRegs = registrations.filter(reg => reg.eventId.status !== 'completed');
  const completedRegs = registrations.filter(reg => reg.eventId.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Profile Header section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-extrabold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
              <p className="text-violet-100 text-sm mt-1">{user.college}</p>
            </div>
          </div>
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium bg-black/10 p-4 rounded-2xl border border-white/10 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-200" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-violet-200" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-200" />
              <span>{user.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-violet-200" />
              <span>{user.year}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200
              ${activeTab === 'upcoming'
                ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
              }`}
          >
            Registered Events ({upcomingRegs.length})
          </button>
          
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200
              ${activeTab === 'completed'
                ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
              }`}
          >
            Completed Programs ({completedRegs.length})
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl border border-red-200/40 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Tab contents */}
        {activeTab === 'upcoming' ? (
          upcomingRegs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm mx-auto">
              <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No active registrations</h3>
              <p className="text-xs text-slate-400 mt-2">
                You haven't registered for any upcoming events yet. Explore events on the home page and sign up!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRegs.map(reg => (
                <div key={reg._id} className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-violet-700 bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-200/20 rounded-full uppercase">
                        {reg.eventId.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        reg.attendanceStatus === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {reg.attendanceStatus}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{reg.eventId.title}</h3>
                    
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-violet-500" /> {new Date(reg.eventId.date).toDateString()}</p>
                      <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-violet-500" /> {reg.eventId.time}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-500" /> {reg.eventId.venue}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReg(reg)}
                    className="w-full mt-6 py-2.5 bg-violet-650 hover:bg-violet-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-violet-500/10 transition-all"
                  >
                    <Ticket className="w-4 h-4" />
                    View Entry Pass
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          completedRegs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm mx-auto">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No completed programs</h3>
              <p className="text-xs text-slate-400 mt-2">
                Completed programs will appear here after the event date has passed and certificates are issued.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedRegs.map(reg => (
                <div key={reg._id} className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-violet-750 bg-violet-100 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-200/25 rounded-full uppercase">
                        {reg.eventId.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        reg.attendanceStatus === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {reg.attendanceStatus === 'Present' ? 'Attended' : 'Absent'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{reg.eventId.title}</h3>
                    
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-violet-500" /> {new Date(reg.eventId.date).toDateString()}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-500" /> {reg.eventId.venue}</p>
                    </div>
                  </div>

                  {reg.attendanceStatus === 'Present' ? (
                    <button
                      onClick={() => handleDownloadCertificate(reg._id, reg.eventId.title)}
                      className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/10 transition-all animate-pulse-slow"
                    >
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  ) : (
                    <div className="w-full mt-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-center text-xs font-semibold rounded-xl border border-slate-200/30 dark:border-slate-800/40 cursor-not-allowed">
                      Certificate Unavailable (Absent)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Ticket Modal */}
      {selectedReg && (
        <TicketModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
        />
      )}
    </div>
  );
};

export default ParticipantDashboard;
