import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Calendar, Users, Award, Percent, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#ddd6fe', '#e879f9', '#f472b6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl max-w-sm border border-slate-200 dark:border-slate-800">
          <p className="text-red-500 font-bold">Error Loading Analytics</p>
          <p className="text-xs text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const { summary, eventwiseData, categoryBreakdown } = data;

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            Analytics & Reports Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Realtime charts tracking event signups, attendance quotients, and category shares
          </p>
        </div>

        {/* Summary Card Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Events */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{summary.totalEvents}</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/40 p-3 rounded-2xl text-violet-600 dark:text-violet-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">All categories and locations combined</p>
          </div>

          {/* Total Registrations */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">{summary.totalRegistrations}</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/40 p-3 rounded-2xl text-violet-600 dark:text-violet-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Individual tickets generated</p>
          </div>

          {/* Attendance Quotient */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Quotient</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{summary.attendancePercentage}%</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Scanned entry ratio</p>
          </div>

          {/* Popular Program */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <div className="flex justify-between items-start">
              <div className="max-w-[70%]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Popular</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-white mt-2 truncate leading-tight">
                  {summary.popularEvent.title}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-2xl text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Signups: <strong className="text-slate-600 dark:text-slate-350">{summary.popularEvent.registrationsCount}</strong>
            </p>
          </div>

        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Event-wise Registrations Bar Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-md">Registrations per Program</h3>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventwiseData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                  <XAxis dataKey="title" tickLine={false} stroke="#94a3b8" />
                  <YAxis tickLine={false} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelClassName="font-bold text-slate-700"
                  />
                  <Bar dataKey="registrations" name="Tickets Sold" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Pie Category breakdown (1/3 width) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-md">Category Share</h3>
            <div className="h-80 w-full relative flex items-center justify-center text-xs">
              {categoryBreakdown.length === 0 ? (
                <p className="text-slate-400">No events data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Trends Comparison Charts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-md">Attendance Breakdown (Present vs Absent)</h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eventwiseData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                <XAxis dataKey="title" tickLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="present" name="Present Attendees" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="absent" name="Absent / Awaiting" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
