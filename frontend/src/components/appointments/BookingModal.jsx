import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { SlotPicker } from './SlotPicker';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { formatCurrency } from '../../utils/formatters';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { Calendar, Clock, Video, MapPin, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, doctor, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState('IN_PERSON');
  const [symptomSummary, setSymptomSummary] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    if (isOpen && doctor?.id && selectedDate) {
      fetchSlots(doctor.id, selectedDate);
    }
  }, [isOpen, doctor?.id, selectedDate]);

  const fetchSlots = async (doctorId, date) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setError(null);
    try {
      const res = await doctorApi.getDoctorAvailability(doctorId, date);
      if (res?.success && Array.isArray(res.data)) {
        setSlots(res.data);
      } else {
        setSlots([]);
      }
    } catch (err) {
      setError('Could not load doctor schedule for this date.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available appointment time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await appointmentApi.bookAppointment({
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        consultationType,
        symptomSummary: symptomSummary.trim(),
      });

      if (res?.success) {
        setBookingSuccess(res.data);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      if (err.status === 409) {
        setError('This slot was just booked by another patient. Please refresh and select another slot.');
        fetchSlots(doctor.id, selectedDate);
      } else {
        setError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setBookingSuccess(null);
    setError(null);
    setSelectedSlot(null);
    setSymptomSummary('');
    onClose();
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={bookingSuccess ? 'Booking Confirmed' : `Book Appointment - Dr. ${doctor.firstName} ${doctor.lastName}`}
      maxWidth="max-w-xl"
    >
      {bookingSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Your Appointment is Confirmed!</h4>
            <p className="text-xs text-slate-500 mt-1">Reference: <span className="font-mono font-bold text-teal-700">{bookingSuccess.appointmentReference}</span></p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 text-left space-y-1.5 max-w-sm mx-auto">
            <p><span className="font-semibold">Doctor:</span> {bookingSuccess.doctorName} ({bookingSuccess.departmentName})</p>
            <p><span className="font-semibold">Date:</span> {formatDate(bookingSuccess.appointmentDate)}</p>
            <p><span className="font-semibold">Time:</span> {bookingSuccess.startTime} - {bookingSuccess.endTime}</p>
            <p><span className="font-semibold">Mode:</span> {bookingSuccess.consultationType}</p>
            <p><span className="font-semibold">Fee:</span> {formatCurrency(bookingSuccess.fee)} (Paid)</p>
          </div>
          <Button variant="primary" onClick={handleModalClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-4">
          {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

          {/* Doctor Brief */}
          <div className="flex items-center gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
              {doctor.firstName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">{doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}</p>
              <p className="text-xs text-teal-700">{doctor.departmentName} • {formatCurrency(doctor.consultationFee)}</p>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Appointment Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                required
              />
            </div>
          </div>

          {/* Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Select Available Time Slot</span>
              <span className="text-[11px] font-normal text-slate-400">30 min duration</span>
            </label>
            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              loading={loadingSlots}
            />
          </div>

          {/* Consultation Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('IN_PERSON')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  consultationType === 'IN_PERSON'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                In-Person Clinic Visit
              </button>
              <button
                type="button"
                onClick={() => setConsultationType('VIDEO')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  consultationType === 'VIDEO'
                    ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4 text-sky-600" />
                Telehealth Video Call
              </button>
            </div>
          </div>

          {/* Reason / Symptom description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit / Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              value={symptomSummary}
              onChange={(e) => setSymptomSummary(e.target.value)}
              placeholder="Briefly describe your symptoms or concern for the doctor..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Summary & Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Due</span>
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(doctor.consultationFee)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={!selectedSlot}
              >
                Confirm & Book
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
