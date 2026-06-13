import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Sun, Moon, Menu, X, LogOut, LayoutDashboard, BarChart2, ScanLine, User } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'dark-none');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' 
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'}
  `;

  return (
    <nav className="glass-navbar sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-violet-600/30 group-hover:scale-105 transition-transform duration-200">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              EventFlow
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>

            {token && user && user.role === 'user' && (
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            )}

            {token && user && user.role === 'admin' && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
                <Link to="/analytics" className={linkClass('/analytics')}>
                  <BarChart2 className="w-4 h-4" />
                  Analytics
                </Link>
                <Link to="/scanner" className={linkClass('/scanner')}>
                  <ScanLine className="w-4 h-4" />
                  QR Scanner
                </Link>
              </>
            )}
          </div>

          {/* Right Actions (Dark Mode, Auth) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {token && user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800/80">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                      {user.name || 'Admin'}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-200/40 dark:border-red-900/30 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card mx-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-2xl transition-all duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/') ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Home
            </Link>

            {token && user && user.role === 'user' && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/dashboard') ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                My Dashboard
              </Link>
            )}

            {token && user && user.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/admin') ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/analytics') ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Analytics
                </Link>
                <Link
                  to="/scanner"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-base font-medium ${isActive('/scanner') ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  QR Scanner
                </Link>
              </>
            )}

            {token && user ? (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 mt-2 px-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-850">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name || 'Admin'}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 mt-2 flex flex-col gap-2 px-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl shadow-md shadow-violet-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
