import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/appointments/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { AddPrescriptionModal } from '../../components/prescriptions/AddPrescriptionModal';
import { formatDate, formatTime, getTodayDateString } from '../../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Video
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePrescriptionAppt, setActivePrescriptionAppt] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [profRes, apptRes] = await Promise.all([
        doctorApi.getMyProfile(),
        appointmentApi.getMyAppointments(),
      ]);

      if (profRes?.success && profRes.data) {
        setProfile(profRes.data);
      }
      if (apptRes?.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }
    } catch {
      // Graceful
    } finally {
      setLoading(false);
    }
  };

  const todayStr = getTodayDateString();
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Doctor Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {profile?.departmentName || 'Specialist'} • License: <span className="font-mono">{profile?.licenseNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={Clock}
            onClick={() => navigate('/doctor/availability')}
          >
            Manage Shifts
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Calendar}
            onClick={() => navigate('/doctor/appointments')}
          >
            View Consultations
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Today's Visits</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{todayAppointments.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Confirmed Upcoming</span>
          <h3 className="text-2xl font-extrabold text-teal-700 mt-0.5">{confirmedCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Completed Consultations</span>
          <h3 className="text-2xl font-extrabold text-blue-700 mt-0.5">{completedCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Patient Rating</span>
          <h3 className="text-2xl font-extrabold text-amber-500 mt-0.5 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{profile?.rating || '4.9'}</span>
          </h3>
        </div>
      </div>

      {/* Today's Schedule Agenda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Schedule & Consultations</h2>
            <p className="text-xs text-slate-500">Scheduled patient consultations for today.</p>
          </div>
          <Link to="/doctor/appointments" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
            View full calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={2} />
        ) : todayAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">{appt.appointmentReference}</span>
                      <h4 className="font-bold text-base text-slate-900 mt-0.5">{appt.patientName}</h4>
                      <p className="text-xs text-slate-500">{appt.patientPhone}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div className="py-3 flex items-center justify-between text-xs text-slate-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      {appt.consultationType === 'VIDEO' ? <Video className="w-3.5 h-3.5 text-sky-600" /> : <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                      {appt.consultationType}
                    </span>
                  </div>

                  {appt.symptomSummary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      <span className="font-semibold text-slate-700">Symptoms: </span>
                      {appt.symptomSummary}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {appt.status !== 'CANCELLED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={FileText}
                      onClick={() => setActivePrescriptionAppt(appt)}
                    >
                      {appt.hasPrescription ? 'Update Prescription' : 'Add Rx & Notes'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-sm text-slate-700">No Appointments Scheduled Today</h3>
            <p className="text-xs text-slate-400">You have no booked patient consultations for today.</p>
          </div>
        )}
      </div>

      {/* Prescription / Notes Modal */}
      {activePrescriptionAppt && (
        <AddPrescriptionModal
          isOpen={!!activePrescriptionAppt}
          onClose={() => setActivePrescriptionAppt(null)}
          appointment={activePrescriptionAppt}
          onSuccess={() => loadDashboard()}
        />
      )}
    </div>
  );
};
