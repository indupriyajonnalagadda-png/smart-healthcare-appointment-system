import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { AddPrescriptionModal } from '../../components/prescriptions/AddPrescriptionModal';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import { Calendar } from 'lucide-react';

export const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [viewPrescriptionApptId, setViewPrescriptionApptId] = useState(null);

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

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status, 'Status updated by attending physician');
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Could not update appointment status');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Doctor Consultation Schedule
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review patient bookings, mark consultations complete, and prescribe digital medications.
        </p>
      </div>

      {/* Tabs */}
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
            {tab === 'ALL' ? 'All Patients' : tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards Grid */}
      {loading ? (
        <SkeletonLoader count={4} />
      ) : filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              isDoctorView={true}
              onUpdateStatus={handleUpdateStatus}
              onAddPrescription={(a) => setPrescriptionAppt(a)}
              onViewPrescription={(a) => setViewPrescriptionApptId(a.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab === 'ALL' ? '' : activeTab.toLowerCase()} consultations`}
          description="You do not have any patient appointments under this category."
        />
      )}

      {/* Add Prescription Modal */}
      {prescriptionAppt && (
        <AddPrescriptionModal
          isOpen={!!prescriptionAppt}
          onClose={() => setPrescriptionAppt(null)}
          appointment={prescriptionAppt}
          onSuccess={() => loadAppointments()}
        />
      )}

      {/* View Prescription Modal */}
      {viewPrescriptionApptId && (
        <PrescriptionModal
          isOpen={!!viewPrescriptionApptId}
          onClose={() => setViewPrescriptionApptId(null)}
          appointmentId={viewPrescriptionApptId}
        />
      )}
    </div>
  );
};
