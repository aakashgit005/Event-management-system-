import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, CheckCircle, XCircle, Search, Download, Award, AlertCircle, RefreshCw } from 'lucide-react';

const AdminEventStats = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('token');

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const eventRes = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(eventRes.data);

      const regRes = await axios.get(`http://localhost:5000/api/registrations/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(regRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch event statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, [id, token]);

  // Handle manual attendance override (for testing fallback)
  const handleToggleAttendance = async (regId, currentStatus) => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    try {
      // We will send registrationId to the verify-qr endpoint or design a direct toggle route.
      // Since our verify-qr endpoint marks attendance as Present, let's trigger it directly!
      // If we need to mark it as Absent, we can create a direct database update route,
      // or we can make a custom toggle endpoint. Let's make a manual patch inside registrations controller.
      // Wait, we can implement manual updates directly on the registrations route, but to keep the backend simple and standard,
      // we can call a direct toggle handler. Let's write a route update.
      // Wait! Let's mock a simple database update or use our express routes.
      // Wait! We can call verify-qr with registrationId for marking present.
      // If we want a general toggle, let's write a quick PUT route or use verify-qr.
      // Wait, since verify-qr already supports marking Present, we can just call:
      if (nextStatus === 'Present') {
        await axios.post(
          'http://localhost:5000/api/registrations/verify-qr',
          { registrationId: regId, eventId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Wait, what if they toggle back to Absent?
        // Let's implement a backend handler if needed, or we can add a small toggle endpoint.
        // Actually, our verify-qr only marks Present. If the admin wants to toggle, we can add a PUT route in registrations.js.
        // Let's check: did we add a PUT route in registrations.js? No, we didn't.
        // Wait! We can add a quick PUT route in registrations.js to make toggle work smoothly.
        // Let's add that when we edit registrations.js next, or we can write a dedicated PUT endpoint right now.
        // Wait, let's check: does registrations.js have a PUT route? Let's check the code we wrote. It has:
        // POST /, GET /my-registrations, GET /event/:eventId, POST /verify-qr, POST /issue-certificates/:eventId, GET /certificate/:registrationId.
        // We can easily call verify-qr for marking Present, which is the most common action (and required by the spec: "Mark attendance through QR code scanning" & "Mark attendance").
        // To allow toggling attendance back and forth manually, let's just make a PUT route in registrations.js:
        // `router.put('/:registrationId/attendance', adminProtect, ...)`
        // Yes! Adding this route makes the manual attendance override extremely solid and complete.
        // Let's write a PUT call to: `http://localhost:5000/api/registrations/${regId}/attendance` with body `{ status: nextStatus }`.
        // Let's make this call.
        await axios.put(
          `http://localhost:5000/api/registrations/${regId}/attendance`,
          { status: nextStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Refresh list
      fetchStatsData();
    } catch (err) {
      console.error(err);
      alert('Could not update attendance status.');
    }
  };

  // Issue certificates & mark event as completed
  const handleIssueCertificates = async () => {
    if (!window.confirm('This will lock registrations, mark the event as Completed, and email PDF Certificates to all Present attendees. Proceed?')) return;
    
    setIssuing(true);
    setSuccessMsg('');
    setError('');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/registrations/issue-certificates/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(res.data.message);
      fetchStatsData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while issuing certificates.');
    } finally {
      setIssuing(false);
    }
  };

  // Export registrations as CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registration records to export.');
      return;
    }

    // CSV Headers
    const headers = ['Registration ID', 'Participant Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Registered Date', 'Attendance Status'];
    
    // CSV Rows
    const rows = registrations.map(reg => [
      reg._id,
      reg.userId.name,
      reg.userId.email,
      reg.userId.phone,
      reg.userId.college,
      reg.userId.department,
      reg.userId.year,
      new Date(reg.registrationDate).toLocaleDateString(),
      reg.attendanceStatus
    ]);

    // Construct CSV Content
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    // Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Registrations_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered registrations
  const filteredRegs = registrations.filter(reg => {
    const searchVal = search.toLowerCase();
    return (
      reg.userId.name.toLowerCase().includes(searchVal) ||
      reg.userId.email.toLowerCase().includes(searchVal) ||
      reg.userId.college.toLowerCase().includes(searchVal) ||
      reg._id.toLowerCase().includes(searchVal)
    );
  });

  const presentCount = registrations.filter(r => r.attendanceStatus === 'Present').length;
  const absentCount = registrations.length - presentCount;

  if (loading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Header Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {event && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-violet-750 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200/20 rounded-full uppercase">
                  {event.category}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  event.status === 'completed' 
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                }`}>
                  {event.status === 'completed' ? 'Completed & Issued' : 'Active Registration'}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mt-2">
                {event.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Event ID: {event._id} | Venue: {event.venue} | Date: {new Date(event.date).toDateString()}
              </p>
            </div>

            {/* Actions button group */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              {event.status !== 'completed' && (
                <button
                  onClick={handleIssueCertificates}
                  disabled={issuing || registrations.length === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-505 disabled:bg-emerald-600/40 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {issuing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                  Complete & Issue Certificates
                </button>
              )}
            </div>
          </div>
        )}

        {/* Alerts messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl border border-red-200/40 dark:border-red-900/30">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-200/40 dark:border-emerald-900/30">
            {successMsg}
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <p className="text-3xl font-extrabold text-violet-650 dark:text-violet-400 mt-2 flex items-center gap-2">
              <Users className="w-7 h-7 text-slate-300" />
              {registrations.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Available seats: {event?.seatsAvailable} / {event?.totalSeats}</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendees Present</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
              <CheckCircle className="w-7 h-7 text-emerald-200 dark:text-emerald-900/50" />
              {presentCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Attendance rate: {registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0}%
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendees Absent</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2 flex items-center gap-2">
              <XCircle className="w-7 h-7 text-amber-200 dark:text-amber-900/50" />
              {absentCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting scanner checking: {absentCount}</p>
          </div>
        </div>

        {/* Registrations List and Search */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-md">
          
          {/* List Toolbar */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row justify-between gap-4 items-center">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Registrations Roll</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search participant details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm glass-input text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Registrations Table */}
          {filteredRegs.length === 0 ? (
            <div className="p-12 text-center text-slate-455">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="font-bold">No participants found</p>
              <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or check back for new signups.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 text-xs font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-850">
                    <th className="px-6 py-4">Participant Name</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Academic Details</th>
                    <th className="px-6 py-4">Date Registered</th>
                    <th className="px-6 py-4">Attendance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {filteredRegs.map(reg => (
                    <tr key={reg._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{reg.userId.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {reg._id}</p>
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        <p>{reg.userId.email}</p>
                        <p className="text-slate-400">{reg.userId.phone}</p>
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        <p className="truncate max-w-[150px]">{reg.userId.college}</p>
                        <p className="text-slate-400">{reg.userId.department} ({reg.userId.year})</p>
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                          reg.attendanceStatus === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {reg.attendanceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleAttendance(reg._id, reg.attendanceStatus)}
                          disabled={event.status === 'completed'}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all
                            ${reg.attendanceStatus === 'Present'
                              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {reg.attendanceStatus === 'Present' ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventStats;
