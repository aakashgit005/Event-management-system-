import React, { useRef } from 'react';
import { X, Printer, Download, Calendar, MapPin, User, BadgeAlert } from 'lucide-react';

const TicketModal = ({ registration, onClose }) => {
  const ticketRef = useRef(null);

  if (!registration) return null;

  const { eventId: event, qrCode, attendanceStatus, _id: ticketId } = registration;
  const user = JSON.parse(localStorage.getItem('user'));

  // Trigger browser print for the ticket only
  const handlePrint = () => {
    const printContent = ticketRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    // Standard print window styling trick
    document.body.innerHTML = `
      <html>
        <head>
          <title>Entry Ticket - ${event.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #fff; color: #000; padding: 20px; }
            .ticket-container { max-width: 500px; margin: 0 auto; border: 2px solid #000; border-radius: 12px; padding: 20px; text-align: center; }
            .qr-img { width: 200px; height: 200px; margin: 20px auto; }
            .perforation { border-top: 2px dashed #ccc; margin: 20px 0; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <h2>${event.title.toUpperCase()}</h2>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toDateString()} at ${event.time}</p>
            <div class="perforation"></div>
            <p><strong>Attendee:</strong> ${user.name}</p>
            <p><strong>College:</strong> ${user.college}</p>
            <img class="qr-img" src="${qrCode}" alt="Ticket QR" />
            <p style="font-family: monospace; font-size: 12px;">Ticket ID: ${ticketId}</p>
            <p><strong>Status:</strong> ${attendanceStatus}</p>
          </div>
        </body>
      </html>
    `;
    
    window.print();
    // Reload page to restore react state
    window.location.reload();
  };

  // Download QR Code image helper
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket_${event.title.replace(/\s+/g, '_')}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/80 max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Your Entry Ticket</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ticket Card (Physical Design) */}
          <div 
            ref={ticketRef} 
            className="relative bg-gradient-to-b from-violet-600/5 to-indigo-600/5 dark:from-violet-500/5 dark:to-indigo-500/5 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-hidden"
          >
            {/* Corner punchouts (classic ticket look) */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 -translate-y-1/2" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 -translate-y-1/2" />

            {/* Top half: Event Details */}
            <div className="pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/50 border border-violet-200/30 rounded-full uppercase">
                {event.category || 'Event Pass'}
              </span>
              <h4 className="mt-2 text-xl font-bold text-slate-850 dark:text-white leading-tight">
                {event.title}
              </h4>
              
              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  {new Date(event.date).toDateString()} at {event.time}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  {event.venue}
                </p>
              </div>
            </div>

            {/* Bottom half: QR Code and Status */}
            <div className="pt-5 text-center flex flex-col items-center">
              <div className="mb-4 bg-white p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 inline-block shadow-sm">
                <img
                  src={qrCode}
                  alt="Ticket QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="text-left w-full space-y-1.5 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/40 mb-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-semibold text-slate-800 dark:text-slate-250">{user.name}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4.5 truncate">
                  College: {user.college}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pl-4.5 truncate">
                  ID: {ticketId}
                </p>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-400">Attendance Status:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  attendanceStatus === 'Present'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                    : 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                }`}>
                  {attendanceStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/80">
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-200/50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
