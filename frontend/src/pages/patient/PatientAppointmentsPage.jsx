import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import { Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PatientAppointmentsPage = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Cancel modal state
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Prescription modal state
  const [prescriptionApptId, setPrescriptionApptId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.getMyAppointments();
      if (res?.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingAppt) return;
    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await appointmentApi.cancelAppointment(cancellingAppt.id, cancelReason);
      if (res?.success) {
        setCancellingAppt(null);
        setCancelReason('');
        loadAppointments();
      }
    } catch (err) {
      setCancelError(err.message || 'Could not cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track consultation schedules, join telehealth sessions, and manage cancellations.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/doctors')}>
          Book New Consultation
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab === 'ALL' ? 'All Visits' : tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              isDoctorView={false}
              onCancel={(a) => setCancellingAppt(a)}
              onViewPrescription={(a) => setPrescriptionApptId(a.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase()} appointments found`}
          description="You do not have any appointments matching this category."
          actionLabel="Book a consultation"
          onAction={() => navigate('/doctors')}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingAppt && (
        <Modal
          isOpen={!!cancellingAppt}
          onClose={() => setCancellingAppt(null)}
          title="Cancel Consultation"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            {cancelError && <Alert type="danger" message={cancelError} />}

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cancellation Policy Notice</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  Appointments can be cancelled up to 2 hours before the scheduled start time. Your reserved slot will be released back to the clinic schedule.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let the doctor know why you need to cancel or reschedule..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCancellingAppt(null)}>
                Keep Appointment
              </Button>
              <Button type="submit" variant="danger" size="sm" loading={cancelLoading}>
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription Viewer */}
      {prescriptionApptId && (
        <PrescriptionModal
          isOpen={!!prescriptionApptId}
          onClose={() => setPrescriptionApptId(null)}
          appointmentId={prescriptionApptId}
        />
      )}
    </div>
  );
};
