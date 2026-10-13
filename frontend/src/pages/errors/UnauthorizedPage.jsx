import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6 shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <span className="text-sm font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-3">
        403 Access Denied
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Unauthorized Area
      </h1>
      <p className="text-slate-600 text-sm max-w-md mb-8">
        You do not have the role permissions required to access this clinical or administrative section.
        {user ? ` Signed in as ${user.email} (${user.role}).` : ''}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign Out & Switch Account
            </button>
            <Link
              to={
                user.role === 'ROLE_ADMIN'
                  ? '/admin'
                  : user.role === 'ROLE_DOCTOR'
                  ? '/doctor'
                  : '/patient'
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};
