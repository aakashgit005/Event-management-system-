import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Phone, Lock, School, BookOpen, GraduationCap,
  AlertCircle, ArrowRight, UserPlus, UserCheck, ShieldAlert, Eye, EyeOff
} from 'lucide-react';

const Signup = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  // animState: 'visible' | 'exit' | 'enter'
  const [animState, setAnimState] = useState('visible');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    college: '',
    department: '',
    year: '1st Year'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const switchingTo = useRef(null);

  const switchTab = (toAdmin) => {
    if (toAdmin === isAdmin) return;
    switchingTo.current = toAdmin;
    setErrors({});
    setServerError('');
    // Phase 1: exit current
    setAnimState('exit');
  };

  useEffect(() => {
    if (animState === 'exit') {
      // After exit animation completes (200ms), flip role + start enter
      const t = setTimeout(() => {
        setIsAdmin(switchingTo.current);
        setAnimState('enter');
      }, 180);
      return () => clearTimeout(t);
    }
    if (animState === 'enter') {
      // After enter animation starts, mark as fully visible
      const t = setTimeout(() => setAnimState('visible'), 220);
      return () => clearTimeout(t);
    }
  }, [animState]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!isAdmin) {
      if (!formData.name.trim()) tempErrors.name = 'Name is required';
      if (!formData.phone.trim()) {
        tempErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone.replace(/[\s\-+]/g, ''))) {
        tempErrors.phone = 'Enter a valid 10-digit phone number';
      }
      if (!formData.college.trim()) tempErrors.college = 'College name is required';
      if (!formData.department.trim()) tempErrors.department = 'Department name is required';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email address format';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { name, email, phone, password, college, department, year } = formData;
      const signupUrl = isAdmin
        ? 'http://localhost:5000/api/auth/admin/signup'
        : 'http://localhost:5000/api/auth/signup';
      const payload = isAdmin
        ? { email, password }
        : { name, email, phone, password, college, department, year };

      const response = await axios.post(signupUrl, payload);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation style based on state
  const formFieldsStyle = {
    transition: 'opacity 200ms ease, transform 200ms ease',
    opacity: animState === 'exit' ? 0 : 1,
    transform:
      animState === 'exit'
        ? 'translateY(-8px)'
        : animState === 'enter'
        ? 'translateY(8px)'
        : 'translateY(0)',
  };

  // Override enter direction: slide up from bottom
  if (animState === 'enter') {
    formFieldsStyle.opacity = 0;
    formFieldsStyle.transform = 'translateY(10px)';
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-xl p-8 rounded-3xl glass-card relative z-10 my-8 animate-slide-up">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Create Account
          </h2>
          <p
            className="text-sm text-slate-500 dark:text-slate-400 mt-2"
            style={{ transition: 'opacity 200ms ease', opacity: animState === 'exit' ? 0 : 1 }}
          >
            {isAdmin
              ? 'Register as an Administrator / Event Organizer'
              : 'Join EventFlow to register for the latest college hackathons and seminars'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            id="tab-participant"
            onClick={() => switchTab(false)}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200
              ${!isAdmin
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <UserCheck className="w-4 h-4" />
            Participant
          </button>
          <button
            type="button"
            id="tab-organizer"
            onClick={() => switchTab(true)}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200
              ${isAdmin
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            Organizer / Admin
          </button>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="flex items-center gap-2 p-3.5 mb-6 text-xs text-red-600 bg-red-50 border border-red-200/50 rounded-2xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Animated form fields wrapper */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div style={formFieldsStyle} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Participant-only: Full Name */}
            {!isAdmin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name}</span>}
              </div>
            )}

            {/* Email — full width when organizer */}
            <div className={`space-y-1 ${isAdmin ? 'md:col-span-2' : ''}`}>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={isAdmin ? 'organizer@eventflow.com' : 'john@example.com'}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email}</span>}
            </div>

            {/* Participant-only: Phone, Year, College, Department */}
            {!isAdmin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <span className="text-[10px] text-red-500 font-semibold">{errors.phone}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academic Year</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white appearance-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">College Name</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="IIT Madras"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.college ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.college && <span className="text-[10px] text-red-500 font-semibold">{errors.college}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.department ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.department && <span className="text-[10px] text-red-500 font-semibold">{errors.department}</span>}
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-red-500 font-semibold">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm glass-input text-slate-800 dark:text-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none z-10"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-[10px] text-red-500 font-semibold">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/60 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create {isAdmin ? 'Organizer / Admin' : 'Participant'} Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-600 dark:text-violet-400 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Sign in
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
