import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Plus, RefreshCw, MapPin, Users, LogOut, Bell, Search, Globe, ChevronDown, ScanLine } from 'lucide-react';
import DotGrid from './DotGrid';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      title: 'EVENTS',
      items: [
        { name: 'All Events', path: '/admin', icon: <Calendar className="w-4 h-4" /> },
        { name: 'Scanner', path: '/scanner', icon: <ScanLine className="w-4 h-4" /> },
      ]
    },
    {
      title: 'USERS',
      items: [
        { name: 'User Management', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0f0f13] text-slate-300 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#16161a] border-r border-[#272730] flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6344ff] flex items-center justify-center text-white font-bold text-xs">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-white text-lg font-bold tracking-wide">EventFlow</span>
            <span className="text-[10px] uppercase font-bold text-[#6344ff] bg-[#6344ff]/10 px-1.5 py-0.5 rounded ml-1">Organizer</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto scrollbar-none">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                        isActive 
                          ? 'bg-[#6344ff] text-white shadow-lg shadow-[#6344ff]/20' 
                          : 'text-slate-400 hover:text-white hover:bg-[#272730]/50'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Bottom */}
        <div className="p-4 border-t border-[#272730]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#272730]/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#272730] flex items-center justify-center text-[#6344ff] font-bold text-xs">
                AO
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">Admin User</span>
                <span className="text-[10px] text-slate-500 truncate w-24">admin@eventos.com</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-[#0f0f13] flex items-center justify-between px-8 flex-shrink-0">
          
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm font-medium text-slate-400">
            <span>Home</span>
            <span className="mx-2 text-slate-600">&gt;</span>
            <span className="text-white">Organizer Panel</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin?action=create')} className="flex items-center gap-1.5 bg-[#6344ff] hover:bg-[#5233e8] text-white px-4 py-1.5 rounded text-sm font-bold transition-colors shadow-md shadow-[#6344ff]/20">
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f13] relative">
          <div className="absolute inset-0 z-0 opacity-60">
            <DotGrid
              dotSize={6}
              gap={20}
              baseColor="#272730"
              activeColor="#6344ff"
              proximity={120}
              shockRadius={200}
              shockStrength={4}
            />
          </div>
          <div className="relative z-10 p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
