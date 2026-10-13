import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { prescriptionApi } from '../../api/prescriptionApi';
import { formatDate } from '../../utils/dateUtils';
import { HeartPulse, Pill, Calendar, User, FileText, CheckCircle2, Download } from 'lucide-react';

export const PrescriptionModal = ({ isOpen, onClose, appointmentId }) => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadPrescription(appointmentId);
    }
  }, [isOpen, appointmentId]);

  const loadPrescription = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await prescriptionApi.getPrescriptionByAppointment(id);
      if (res?.success && res.data) {
        setPrescription(res.data);
      } else {
        setError('No prescription found for this appointment.');
      }
    } catch (err) {
      setError(err.message || 'Could not load prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Medical Prescription & Notes"
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <SkeletonLoader count={4} />
      ) : error ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          {error}
        </div>
      ) : prescription ? (
        <div className="space-y-6" id="prescription-print-area">
          {/* Clinic Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-teal text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">SmartHealth Medical Center</h4>
                <p className="text-xs text-slate-500">Ref: {prescription.appointmentReference}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-800">Date: {formatDate(prescription.createdAt)}</p>
              <p className="text-teal-700 font-medium">{prescription.departmentName}</p>
            </div>
          </div>

          {/* Doctor & Patient Info */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Attending Doctor</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{prescription.doctorName}</p>
              <p className="text-slate-500">{prescription.doctorQualifications}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Patient Name</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{prescription.patientName}</p>
              <p className="text-slate-500">Prescription ID: #{prescription.id}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Clinical Diagnosis
            </h5>
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-800 font-medium">
              {prescription.diagnosis}
            </div>
          </div>

          {/* Clinical SOAP Notes if present */}
          {prescription.consultationNote && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <h5 className="font-semibold text-slate-700">Doctor's Consultation Notes</h5>
              {prescription.consultationNote.patientVitals && (
                <p><span className="text-slate-500 font-medium">Vitals:</span> {prescription.consultationNote.patientVitals}</p>
              )}
              {prescription.consultationNote.assessment && (
                <p><span className="text-slate-500 font-medium">Assessment:</span> {prescription.consultationNote.assessment}</p>
              )}
              {prescription.consultationNote.plan && (
                <p><span className="text-slate-500 font-medium">Care Plan:</span> {prescription.consultationNote.plan}</p>
              )}
            </div>
          )}

          {/* Prescribed Medications */}
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Prescribed Medications (Rx)
            </h5>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-left">Medicine</th>
                    <th className="px-3 py-2 text-left">Dosage</th>
                    <th className="px-3 py-2 text-left">Frequency</th>
                    <th className="px-3 py-2 text-left">Duration</th>
                    <th className="px-3 py-2 text-left">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {prescription.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2.5 font-bold text-slate-800">{item.medicineName}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.dosage}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.frequency}</td>
                      <td className="px-3 py-2.5 text-slate-600">{item.duration}</td>
                      <td className="px-3 py-2.5 text-slate-500 italic">{item.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Follow up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            {prescription.clinicalAdvice && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="font-semibold text-amber-900 block mb-0.5">Lifestyle Advice & Precautions:</span>
                <p className="text-amber-800 leading-relaxed">{prescription.clinicalAdvice}</p>
              </div>
            )}
            {prescription.followUpDate && (
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="font-semibold text-sky-900 block">Recommended Follow-up:</span>
                  <span className="text-sky-800 font-medium">{formatDate(prescription.followUpDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" icon={Download} onClick={handlePrint}>
              Print / Save PDF
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
