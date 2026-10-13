import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { SlotPicker } from '../../components/appointments/SlotPicker';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { 
  Star, 
  Award, 
  Clock, 
  MapPin, 
  Video, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft,
  Building2,
  FileCheck
} from 'lucide-react';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consultationType, setConsultationType] = useState('IN_PERSON');
  const [symptomSummary, setSymptomSummary] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    loadDoctor();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      loadSlots();
    }
  }, [id, selectedDate]);

  const loadDoctor = async () => {
    setLoadingDoctor(true);
    try {
      const res = await doctorApi.getDoctorById(id);
      if (res?.success && res.data) {
        setDoctor(res.data);
      }
    } catch {
      // Graceful
    } finally {
      setLoadingDoctor(false);
    }
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setBookingError(null);
    try {
      const res = await doctorApi.getDoctorAvailability(id, selectedDate);
      if (res?.success && Array.isArray(res.data)) {
        setSlots(res.data);
      } else {
        setSlots([]);
      }
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } });
      return;
    }
    if (!isPatient) {
      setBookingError('Only registered patients can book appointments. Please log in with a patient account.');
      return;
    }
    if (!selectedSlot) {
      setBookingError('Please choose an available appointment slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await appointmentApi.bookAppointment({
        doctorId: Number(id),
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        consultationType,
        symptomSummary: symptomSummary.trim(),
      });

      if (res?.success) {
        setBookingSuccess(res.data);
      }
    } catch (err) {
      if (err.status === 409) {
        setBookingError('This slot was just taken by another patient. Please pick another slot.');
        loadSlots();
      } else {
        setBookingError(err.message || 'Booking failed.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-500">Doctor profile not found.</p>
        <Button variant="outline" onClick={() => navigate('/doctors')}>
          Back to Doctors List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to search results
      </button>

      {/* Main Doctor Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-8 space-y-5">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl gradient-teal text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
              {doctor.firstName?.[0] || 'D'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{doctor.fullName}</h1>
                <ShieldCheck className="w-5 h-5 text-teal-600" title="Verified License" />
              </div>
              <p className="text-sm font-semibold text-teal-700">{doctor.departmentName}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                </div>
                <span>•</span>
                <span>{doctor.reviewCount} verified patient reviews</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {doctor.specializations?.map((spec, i) => (
              <Badge key={i} variant="primary" size="md">
                {spec.name || spec}
              </Badge>
            ))}
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Professional Biography
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {doctor.bio || 'Board-certified clinical practitioner committed to patient-centered, evidence-based care.'}
            </p>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
              <span className="font-bold text-slate-800 text-sm">{doctor.experienceYears} Years</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Medical License</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{doctor.licenseNumber}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Qualifications</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{doctor.qualifications}</span>
            </div>
          </div>
        </div>

        {/* Side Consultation Info */}
        <div className="md:col-span-4 bg-teal-50/50 p-6 rounded-2xl border border-teal-100/70 space-y-4">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Standard Consultation Fee</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
              {formatCurrency(doctor.consultationFee)}
            </span>
            <span className="text-[11px] text-teal-700 font-medium block mt-0.5">30-minute certified session</span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-teal-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Instant Appointment Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Digital Prescription Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Full Cancellation Guarantee (Up to 2h)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Book Your Appointment with {doctor.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose an appointment date to see available time slots in real time.
          </p>
        </div>

        {bookingSuccess ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-950">Appointment Confirmed!</h3>
            <p className="text-xs text-emerald-800">
              Reference code: <span className="font-mono font-bold">{bookingSuccess.appointmentReference}</span>
            </p>
            <p className="text-xs text-slate-600">
              Scheduled on {formatDate(bookingSuccess.appointmentDate)} at {bookingSuccess.startTime} ({bookingSuccess.consultationType})
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" size="sm" onClick={() => navigate('/patient/appointments')}>
                View in My Appointments
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-5">
            {bookingError && <Alert type="danger" message={bookingError} onClose={() => setBookingError(null)} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Date
                </label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Consultation Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Select Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consultationType === 'IN_PERSON'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('VIDEO')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      consultationType === 'VIDEO'
                        ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-sky-600" />
                    Telehealth Video
                  </button>
                </div>
              </div>
            </div>

            {/* Slot picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Select Available Slot for {formatDate(selectedDate)}
              </label>
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
                loading={loadingSlots}
              />
            </div>

            {/* Symptoms summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                4. Primary Symptoms / Reason for Consultation (Optional)
              </label>
              <textarea
                rows={2}
                value={symptomSummary}
                onChange={(e) => setSymptomSummary(e.target.value)}
                placeholder="Describe any symptoms or context for Dr. to review prior to the consultation..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Session Fee</span>
                <span className="text-xl font-extrabold text-slate-900">{formatCurrency(doctor.consultationFee)}</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={bookingLoading}
                disabled={!selectedSlot}
              >
                Book Appointment Slot
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
