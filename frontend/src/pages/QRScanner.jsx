import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Scan, RefreshCw, AlertCircle, CheckCircle, HelpCircle, ArrowRight, CornerDownRight, Keyboard } from 'lucide-react';

const QRScanner = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Scanning feedback states
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'warning'|'error', message: '', participant: {} }
  const [manualId, setManualId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const scannerRef = useRef(null);
  const token = localStorage.getItem('token');

  // Fetch upcoming events to select from
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('https://event-management-system-gx6p.onrender.com/api/events');
        // Show all events
        setEvents(res.data);
        if (res.data.length > 0) {
          setSelectedEventId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch events dropdown.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Initialize and clean up camera scanner
  useEffect(() => {
    if (!selectedEventId || loading) return;

    // Create unique scanner instance
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader-container",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    html5QrcodeScanner.render(
      (decodedText) => handleScanSuccess(decodedText),
      (errorMessage) => {
        // Silent failure to avoid flooding logs during active scan searching
      }
    );

    scannerRef.current = html5QrcodeScanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.error("Error clearing scanner on unmount:", err);
        });
      }
    };
  }, [selectedEventId, loading]);

  // Handle scanned token
  const handleScanSuccess = async (decodedText) => {
    setScanResult(null);
    
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(decodedText);
    } catch (e) {
      setScanResult({
        status: 'error',
        message: 'Invalid Ticket. QR Code is not formatted correctly.'
      });
      return;
    }

    const { registrationId, eventId } = parsedPayload;
    if (!registrationId || !eventId) {
      setScanResult({
        status: 'error',
        message: 'Invalid Ticket payload. Missing key details.'
      });
      return;
    }

    // Verify it matches the event selected in dropdown
    if (eventId !== selectedEventId) {
      setScanResult({
        status: 'error',
        message: 'Ticket belongs to a different event. Please double check.'
      });
      return;
    }

    // Call backend to verify and mark attendance
    await submitAttendance(registrationId);
  };

  // Common submit function for scanner and manual typing
  const submitAttendance = async (registrationId) => {
    try {
      const res = await axios.post(
        'https://event-management-system-gx6p.onrender.com/api/registrations/verify-qr',
        { registrationId, eventId: selectedEventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, alreadyMarked, registration } = res.data;

      if (alreadyMarked) {
        setScanResult({
          status: 'warning',
          message: `${registration.userId.name} is already marked Present.`,
          participant: registration.userId
        });
      } else {
        // Fresh attendance success!
        confetti({
          particleCount: 50,
          spread: 40,
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });

        setScanResult({
          status: 'success',
          message: `Attendance marked for ${registration.userId.name}!`,
          participant: registration.userId
        });
      }
    } catch (err) {
      console.error(err);
      setScanResult({
        status: 'error',
        message: err.response?.data?.message || 'Error occurred. Ticket not recognized.'
      });
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    setManualLoading(true);
    setScanResult(null);
    await submitAttendance(manualId.trim());
    setManualId('');
    setManualLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-2">
            <Scan className="w-8 h-8 text-violet-650 dark:text-violet-400" />
            Gate Entry QR Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark participant attendance instantly using QR code scanning
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl border border-red-250">
            {error}
          </div>
        )}

        {/* Configurations Bar */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-md">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Active Scanning Program
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setScanResult(null);
            }}
            className="w-full px-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white appearance-none"
          >
            {events.length === 0 ? (
              <option value="">No events configured</option>
            ) : (
              events.map(evt => (
                <option key={evt._id} value={evt._id}>
                  {evt.title} ({new Date(evt.date).toDateString()})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Layout Scanner area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Camera Scanner Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col items-center">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 self-start">Camera Stream</h3>
            
            {/* The html5-qrcode target div */}
            <div 
              id="qr-reader-container" 
              className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
            
            <p className="text-[10px] text-slate-400 mt-4 text-center">
              Grant webcam camera access to activate live entry scanner
            </p>
          </div>

          {/* Right: Scan Results and Manual Override Fallback */}
          <div className="space-y-6">
            
            {/* Realtime Scan Result Display */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md min-h-[200px] flex flex-col justify-center">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 self-start">Scan Feedback</h3>
              
              {!scanResult ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
                  <Scan className="w-10 h-10 text-slate-200 animate-pulse" />
                  <p className="text-xs font-semibold">Awaiting ticket scan...</p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    scanResult.status === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                      : scanResult.status === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                  }`}>
                    {scanResult.status === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    {scanResult.status === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    {scanResult.status === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    
                    <div>
                      <p className="text-sm font-bold">{scanResult.message}</p>
                    </div>
                  </div>

                  {/* Scanned User Profile Details card */}
                  {scanResult.participant && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Attendee Details</p>
                      <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Name:</strong> {scanResult.participant.name}</p>
                      <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">College:</strong> {scanResult.participant.college}</p>
                      <p className="text-slate-500"><strong className="text-slate-600 dark:text-slate-400">Department:</strong> {scanResult.participant.department} ({scanResult.participant.year})</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Text ID Fallback */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Keyboard className="w-4.5 h-4.5 text-violet-600" />
                Manual Entry Fallback
              </h3>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Participant Ticket ID / Registration ID</label>
                  <input
                    type="text"
                    required
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Enter Registration ID"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm glass-input text-slate-850 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualLoading || !manualId.trim()}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-505 disabled:bg-violet-600/60 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {manualLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    'Verify ID & Mark Present'
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default QRScanner;
