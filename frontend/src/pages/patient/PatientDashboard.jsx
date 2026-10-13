import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/appointmentApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Sparkles, 
  Search, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Video,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/appointments/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescriptionApptId, setSelectedPrescriptionApptId] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [apptRes, prescRes] = await Promise.all([
        appointmentApi.getMyAppointments(),
        prescriptionApi.getMyPrescriptions(),
      ]);

      if (apptRes?.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }
      if (prescRes?.success && Array.isArray(prescRes.data)) {
        setPrescriptions(prescRes.data);
      }
    } catch {
      // Graceful
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const nextAppointment = upcomingAppointments[0] || null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Patient Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your clinical consultations, digital prescriptions, and AI symptom triage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="soft"
            size="md"
            icon={Sparkles}
            onClick={() => navigate('/ai-recommendation')}
          >
            AI Symptom Check
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Search}
            onClick={() => navigate('/doctors')}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Upcoming Visits</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{upcomingAppointments.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Appointments</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{appointments.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Prescriptions</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{prescriptions.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Next Appointment & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointment Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Next Upcoming Consultation</h2>
            <Link to="/patient/appointments" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader count={1} />
          ) : nextAppointment ? (
            <div className="bg-white rounded-3xl p-6 border border-teal-200/80 shadow-xs space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-0 pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {nextAppointment.appointmentReference}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{nextAppointment.doctorName}</h3>
                  <p className="text-xs text-teal-700 font-medium">{nextAppointment.departmentName} • {nextAppointment.doctorSpecialization}</p>
                </div>
                <StatusBadge status={nextAppointment.status} />
              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Date</span>
                  <span className="font-semibold">{formatDate(nextAppointment.appointmentDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Time Slot</span>
                  <span className="font-semibold">{formatTime(nextAppointment.startTime)} - {formatTime(nextAppointment.endTime)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Mode</span>
                  <span className="font-semibold flex items-center gap-1">
                    {nextAppointment.consultationType === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-sky-600" /> : <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                    {nextAppointment.consultationType}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/patient/appointments')}
                >
                  Manage Appointment
                </Button>
                {nextAppointment.consultationType === 'VIDEO' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Video}
                    onClick={() => alert('Telehealth consultation session will activate 10 minutes prior to scheduled start time.')}
                  >
                    Join Video Call
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Upcoming Consultations</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need medical advice? Search verified doctors or use our AI symptom navigator for instant department recommendations.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/doctors')} className="mt-2">
                Find and Book a Doctor
              </Button>
            </div>
          )}

          {/* Recent Prescriptions Preview */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Medical Prescriptions</h2>
              <Link to="/patient/prescriptions" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-100 text-center">
                No prescriptions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">{formatDate(p.createdAt)}</span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{p.diagnosis}</h4>
                      <p className="text-xs text-teal-700">{p.doctorName} • {p.items?.length || 0} Medications</p>
                    </div>
                    <Button
                      variant="soft"
                      size="sm"
                      icon={FileText}
                      onClick={() => setSelectedPrescriptionApptId(p.appointmentId)}
                    >
                      View Rx
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Symptom Navigator Callout Card */}
        <div className="space-y-5">
          <div className="p-6 rounded-3xl gradient-teal text-white shadow-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold leading-tight">
              AI-Powered Doctor Recommendation
            </h3>
            <p className="text-xs text-teal-50/90 leading-relaxed">
              Describe your symptoms in natural language. Get an instant match to verified medical departments and appropriate specialists.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white text-teal-800 border-none font-bold hover:bg-teal-50"
              onClick={() => navigate('/ai-recommendation')}
            >
              Analyze Symptoms Now
            </Button>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Quick Actions</h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => navigate('/doctors')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Browse Specialists</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Appointment History</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/patient/profile')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Update Medical History</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Viewer Modal */}
      {selectedPrescriptionApptId && (
        <PrescriptionModal
          isOpen={!!selectedPrescriptionApptId}
          onClose={() => setSelectedPrescriptionApptId(null)}
          appointmentId={selectedPrescriptionApptId}
        />
      )}
    </div>
  );
};
