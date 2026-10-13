import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { prescriptionApi } from '../../api/prescriptionApi';
import { Plus, Trash2, Pill, Activity, Calendar, FileText } from 'lucide-react';

export const AddPrescriptionModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalAdvice, setClinicalAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [patientVitals, setPatientVitals] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  const [items, setItems] = useState([
    { medicineName: '', dosage: '500 mg', frequency: 'Twice daily after meals', duration: '5 days', instructions: 'Take with full glass of water' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { medicineName: '', dosage: '1 tablet', frequency: 'Once daily', duration: '7 days', instructions: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemField = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Please provide a clinical diagnosis.');
      return;
    }

    const invalidItems = items.some((item) => !item.medicineName.trim());
    if (invalidItems) {
      setError('All prescribed medication rows must have a valid medicine name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await prescriptionApi.addPrescription(appointment.id, {
        diagnosis: diagnosis.trim(),
        clinicalAdvice: clinicalAdvice.trim(),
        followUpDate: followUpDate || null,
        patientVitals: patientVitals.trim(),
        assessment: assessment.trim(),
        plan: plan.trim(),
        items: items.map((item) => ({
          medicineName: item.medicineName.trim(),
          dosage: item.dosage.trim(),
          frequency: item.frequency.trim(),
          duration: item.duration.trim(),
          instructions: item.instructions.trim(),
        })),
      });

      if (res?.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Could not save prescription.');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Prescription - ${appointment.patientName}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

        {/* Appointment & Patient Info banner */}
        <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-800">Patient: {appointment.patientName}</span>
            <span className="text-slate-500 ml-2">({appointment.patientPhone})</span>
          </div>
          <span className="font-mono text-teal-800 font-semibold">{appointment.appointmentReference}</span>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Diagnosis *
          </label>
          <input
            type="text"
            required
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g., Acute Viral Bronchitis / Essential Hypertension / Atopic Dermatitis"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Patient Vitals & Clinical Assessment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              Patient Vitals (Optional)
            </label>
            <input
              type="text"
              value={patientVitals}
              onChange={(e) => setPatientVitals(e.target.value)}
              placeholder="BP: 120/80 mmHg, HR: 72 bpm, SpO2: 98%"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Recommended Follow-Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Prescription Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Prescribed Medications *
            </label>
            <Button type="button" variant="soft" size="sm" icon={Plus} onClick={addItemRow}>
              Add Medicine
            </Button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Amoxicillin)"
                    value={item.medicineName}
                    onChange={(e) => updateItemField(idx, 'medicineName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (500mg)"
                    value={item.dosage}
                    onChange={(e) => updateItemField(idx, 'dosage', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Frequency"
                    value={item.frequency}
                    onChange={(e) => updateItemField(idx, 'frequency', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-10 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={item.duration}
                    onChange={(e) => updateItemField(idx, 'duration', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-center">
                  <button
                    type="button"
                    disabled={items.length === 1}
                    onClick={() => removeItemRow(idx)}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Advice, Diet, & Precautions
          </label>
          <textarea
            rows={2}
            value={clinicalAdvice}
            onChange={(e) => setClinicalAdvice(e.target.value)}
            placeholder="Hydration advice, bed rest, allergy precautions, or special instructions..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Save & Complete Consultation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
