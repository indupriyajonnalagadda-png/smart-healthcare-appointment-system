import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../api/prescriptionApi';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/dateUtils';
import { FileText, Pill, Calendar, Download } from 'lucide-react';

export const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApptId, setSelectedApptId] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionApi.getMyPrescriptions();
      if (res?.success && Array.isArray(res.data)) {
        setPrescriptions(res.data);
      } else {
        setPrescriptions([]);
      }
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Prescriptions & Medical Advice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Access your digital prescriptions, clinical diagnosis summaries, and medication dosage guidelines.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader count={3} />
      ) : prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">
                      Ref: {p.appointmentReference}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{p.diagnosis}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{p.doctorName} • {p.departmentName}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{formatDate(p.createdAt)}</span>
                </div>

                {/* Medications preview list */}
                <div className="py-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    Medications ({p.items?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.items?.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                      >
                        {item.medicineName} ({item.dosage})
                      </span>
                    ))}
                  </div>
                </div>

                {p.clinicalAdvice && (
                  <p className="text-xs text-slate-600 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100 line-clamp-2">
                    <span className="font-semibold text-teal-800">Advice: </span>
                    {p.clinicalAdvice}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {p.followUpDate ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    Follow-up: {formatDate(p.followUpDate)}
                  </span>
                ) : <div />}

                <Button
                  variant="primary"
                  size="sm"
                  icon={FileText}
                  onClick={() => setSelectedApptId(p.appointmentId)}
                >
                  View Official Rx
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Prescriptions Recorded"
          description="You do not have any prescriptions on file yet. Prescriptions added by your attending doctor will automatically appear here."
        />
      )}

      {selectedApptId && (
        <PrescriptionModal
          isOpen={!!selectedApptId}
          onClose={() => setSelectedApptId(null)}
          appointmentId={selectedApptId}
        />
      )}
    </div>
  );
};
