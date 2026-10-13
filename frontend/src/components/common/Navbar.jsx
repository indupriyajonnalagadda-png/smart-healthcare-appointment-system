import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  HeartPulse, 
  Sparkles, 
  Bell, 
  User, 
  LogOut, 
  Calendar, 
  LayoutDashboard, 
  Menu, 
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const navLinks = [
    { label: 'Find Doctors', path: '/doctors' },
    { label: 'AI Symptom Navigator', path: '/ai-recommendation', highlight: true },
    { label: 'Departments', path: '/#departments' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Smart<span className="text-teal-600">Health</span></span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-semibold tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">AI Clinical</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    link.highlight
                      ? 'text-teal-700 bg-teal-50/80 hover:bg-teal-100 border border-teal-200/50 flex items-center gap-1.5'
                      : active
                      ? 'text-teal-600 bg-teal-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                        <span className="text-xs text-slate-400">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors text-left ${
                                !n.read ? 'bg-teal-50/40 hover:bg-teal-50/80' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200/80 bg-white shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-xs font-semibold text-slate-800">
                        {user?.firstName}
                      </span>
                      <span className="hidden lg:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                        {user?.role?.replace('ROLE_', '')}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Dashboard
                        </Link>

                        {isPatient && (
                          <>
                            <Link
                              to="/patient/appointments"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              My Appointments
                            </Link>
                            <Link
                              to="/patient/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              My Profile
                            </Link>
                          </>
                        )}

                        {isDoctor && (
                          <Link
                            to="/doctor/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            Doctor Profile
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
