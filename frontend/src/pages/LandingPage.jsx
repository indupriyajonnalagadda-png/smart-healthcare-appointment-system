import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  ShieldCheck, 
  HeartPulse, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Award,
  Clock,
  Activity,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { doctorApi } from '../api/doctorApi';
import { departmentApi } from '../api/departmentApi';
import { BookingModal } from '../components/appointments/BookingModal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [topDoctors, setTopDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const docRes = await doctorApi.searchDoctors({ size: 6, sortBy: 'rating', direction: 'desc' });
      if (docRes?.success && docRes.data?.content) {
        setTopDoctors(docRes.data.content);
      }
      const deptRes = await departmentApi.getAllDepartments();
      if (deptRes?.success && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-soft border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Next-Generation Healthcare Scheduling with AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Smart Clinical Care, <br />
                <span className="text-teal-600">Powered by AI Navigation</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect seamlessly with top medical specialists. Describe your symptoms in natural language for intelligent department guidance, review real-time availability, and book certified consultations instantly.
              </p>

              {/* Live Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl">
                <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-lg shadow-teal-950/5 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search doctor name, specialty, or condition..."
                      className="w-full pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" className="shrink-0 px-5 shadow-sm">
                    Find Doctors
                  </Button>
                </div>
              </form>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-5 border-t border-slate-200/80 max-w-lg">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block tracking-tight">500+</span>
                  <span className="text-xs font-medium text-slate-500">Verified Doctors</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block tracking-tight">30 Min</span>
                  <span className="text-xs font-medium text-slate-500">Scheduled Slots</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block tracking-tight">99.8%</span>
                  <span className="text-xs font-medium text-slate-500">Patient Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6 relative z-10">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-teal text-white flex items-center justify-center font-bold">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Smart Health Navigator</h4>
                      <p className="text-[11px] text-teal-700 font-semibold">Real-Time Clinical Match</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Try AI Symptom Navigation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "I have severe chest tightness, elevated blood pressure, and left shoulder soreness."
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Matched: Cardiology</span>
                    <Link to="/ai-recommendation" className="text-teal-700 font-bold hover:underline flex items-center gap-1">
                      Explore AI <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>No double-booking: Real-time concurrency protection</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Telehealth video or in-person clinic visits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Digital prescription and SOAP consultation notes</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  icon={Sparkles}
                  onClick={() => navigate('/ai-recommendation')}
                >
                  Start Symptom Check Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendation Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl gradient-teal text-white p-8 sm:p-12 shadow-xl shadow-teal-700/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Healthcare Guidance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unsure which specialist you need to consult?
            </h2>
            <p className="text-sm text-teal-50/90 leading-relaxed">
              Describe your symptoms in everyday natural language. Our clinical AI analyzes your concern, maps it safely to validated hospital departments, and flags any urgent emergency warning signs.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              variant="outline"
              size="lg"
              className="bg-white hover:bg-teal-50 text-teal-800 font-bold border-none shadow-lg"
              onClick={() => navigate('/ai-recommendation')}
            >
              Consult AI Navigator
            </Button>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Specialized Medicine</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Our Medical Departments</h2>
          </div>
          <Link to="/doctors" className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            View all departments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => navigate(`/doctors?departmentId=${dept.id}`)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 group-hover:bg-teal-600 group-hover:text-white text-teal-700 transition-colors flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {dept.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Top Rated Specialists</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Doctors</h2>
          </div>
          <Link to="/doctors" className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            Browse all doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={(d) => setSelectedDoctorForBooking(d)}
            />
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          doctor={selectedDoctorForBooking}
          onSuccess={() => navigate('/patient/appointments')}
        />
      )}
    </div>
  );
};
