import React from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert } from 'lucide-react';

export const EmergencyBanner = ({ message }) => {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-lg shadow-red-500/10 text-red-900 animate-in fade-in duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Urgent Medical Alert
            </span>
            <span className="text-xs font-semibold text-red-700">Immediate Action Advised</span>
          </div>
          <h4 className="text-base font-bold text-red-950 mt-1">
            Potential Critical Emergency Detected
          </h4>
          <p className="text-xs text-red-800 leading-relaxed mt-1">
            {message || "The symptoms described may represent a medical emergency. Do not wait for a routine appointment."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Emergency (911 / 112)
            </a>
            <span className="text-[11px] text-red-700 font-medium">
              Or proceed immediately to the nearest hospital Emergency Room (ER).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
