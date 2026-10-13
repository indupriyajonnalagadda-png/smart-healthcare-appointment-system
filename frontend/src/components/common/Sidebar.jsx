import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Calendar,
  FileText,
  User,
  Clock,
  Shield,
  Users,
  Building,
  Activity,
  History
} from 'lucide-react';

export const Sidebar = () => {
  const { isPatient, isDoctor, isAdmin } = useAuth();

  const patientLinks = [
    { label: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Find Doctors', path: '/doctors', icon: Search },
    { label: 'AI Navigator', path: '/ai-recommendation', icon: Sparkles, badge: 'AI' },
    { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
    { label: 'Profile & Health', path: '/patient/profile', icon: User },
  ];

  const doctorLinks = [
    { label: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Consultations', path: '/doctor/appointments', icon: Calendar },
    { label: 'Weekly Schedule', path: '/doctor/availability', icon: Clock },
    { label: 'Professional Profile', path: '/doctor/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Analytics Dashboard', path: '/admin/dashboard', icon: Activity },
    { label: 'Manage Doctors', path: '/admin/doctors', icon: Users },
    { label: 'User Directory', path: '/admin/patients', icon: User },
    { label: 'All Appointments', path: '/admin/appointments', icon: Calendar },
    { label: 'Departments & Specs', path: '/admin/departments', icon: Building },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  let links = patientLinks;
  if (isDoctor) links = doctorLinks;
  if (isAdmin) links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path.endsWith('/dashboard')}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
