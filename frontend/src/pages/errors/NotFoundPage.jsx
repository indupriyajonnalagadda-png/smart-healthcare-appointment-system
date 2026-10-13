import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>
      <span className="text-sm font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-3">
        404 Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Does Not Exist
      </h1>
      <p className="text-slate-600 text-sm max-w-md mb-8">
        The medical portal page you requested may have moved, expired, or been entered incorrectly.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Return to Portal
        </Link>
      </div>
    </div>
  );
};
