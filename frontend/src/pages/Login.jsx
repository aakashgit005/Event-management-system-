import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const loginUrl = isAdmin 
      ? 'http://localhost:5000/api/auth/admin/login' 
      : 'http://localhost:5000/api/auth/login';

    try {
      const response = await axios.post(loginUrl, formData);
      const { token, user } = response.data;

      // Save token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect depending on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 dark:bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl glass-card relative z-10 animate-slide-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Access your EventFlow account
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setIsAdmin(false); setError(''); }}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200
              ${!isAdmin 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
          >
            <UserCheck className="w-4 h-4" />
            Participant
          </button>
          
          <button
            type="button"
            onClick={() => { setIsAdmin(true); setError(''); }}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200
              ${isAdmin 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            Administrator
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-6 text-xs text-red-600 bg-red-50 border border-red-200/50 rounded-2xl dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={isAdmin ? "admin@eventflow.com" : "john@example.com"}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm glass-input text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm glass-input text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/60 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In as {isAdmin ? 'Admin' : 'Participant'}
              </>
            )}
          </button>
        </form>

        {/* Signup redirection link (only for participants) */}
        {!isAdmin && (
          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to EventFlow?{' '}
              <Link
                to="/signup"
                className="text-violet-600 dark:text-violet-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Create an account
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
