import React from 'react';
import { HeartPulse, ShieldCheck, Activity, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              Smart<span className="text-teal-400">Health</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent healthcare scheduling and clinical appointment system powered by modern AI-assisted medical triage navigation.
            </p>
            <div className="flex items-center gap-3 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant Architecture</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/ai-recommendation" className="hover:text-white transition-colors">AI Symptom Navigator</Link></li>
              <li><Link to="/#departments" className="hover:text-white transition-colors">Medical Specialties</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Patient Registration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Clinical Departments</h4>
            <ul className="space-y-2 text-xs">
              <li>Cardiology & Vascular</li>
              <li>Dermatology & Skin Pathology</li>
              <li>Orthopedics & Joint Care</li>
              <li>Pediatrics & Adolescent Care</li>
              <li>Neurology & Cognitive Health</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Emergency & Safety</h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 leading-relaxed mb-3">
              <span className="font-semibold text-rose-400 block mb-1">Notice for Emergencies:</span>
              If experiencing chest pain, severe shortness of breath, or trauma, contact emergency services (911/112) immediately.
            </div>
            <p className="text-[11px] text-slate-500">
              AI recommendations are for navigation assistance only and do not replace professional medical diagnosis.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Smart Healthcare Appointment System. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Clinical Governance</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
