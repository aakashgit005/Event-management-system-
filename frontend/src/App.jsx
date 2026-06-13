import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ParticipantDashboard from './pages/ParticipantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventStats from './pages/AdminEventStats';
import QRScanner from './pages/QRScanner';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Participant Protected Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <ParticipantDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Dashboard & Operations */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/event/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEventStats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scanner"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <QRScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
