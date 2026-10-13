import React from 'react';
import { Calendar, Clock, MapPin, Video, FileText, XCircle, CheckCircle, User } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../common/Button';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

export const AppointmentCard = ({
  appointment,
  isDoctorView = false,
  onCancel,
  onViewPrescription,
  onAddPrescription,
  onUpdateStatus,
}) => {
  const isCancellable = appointment.status === 'CONFIRMED' || appointment.status === 'PENDING';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-wider">
              {appointment.appointmentReference}
            </span>
            <h4 className="font-bold text-base text-slate-900 mt-0.5">
              {isDoctorView ? appointment.patientName : appointment.doctorName}
            </h4>
            <p className="text-xs text-teal-700 font-medium">
              {isDoctorView ? (appointment.patientPhone || 'Patient') : `${appointment.departmentName || ''} • ${appointment.doctorSpecialization || ''}`}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Schedule & Mode Info */}
        <div className="grid grid-cols-2 gap-3 py-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            {appointment.consultationType === 'VIDEO' ? (
              <Video className="w-4 h-4 text-sky-600 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{appointment.consultationType === 'VIDEO' ? 'Telehealth Video' : 'Clinic Visit'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{formatCurrency(appointment.fee)}</span>
            <span className="text-[10px] text-slate-400">({appointment.paymentStatus})</span>
          </div>
        </div>

        {/* Symptoms snippet if provided */}
        {appointment.symptomSummary && (
          <div className="mt-1 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
            <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">Reason for Visit:</span>
            <p className="line-clamp-2 leading-relaxed">{appointment.symptomSummary}</p>
          </div>
        )}

        {/* Cancellation Reason if cancelled */}
        {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
          <div className="mt-2 p-2.5 bg-rose-50 text-rose-800 rounded-xl text-xs border border-rose-100">
            <span className="font-semibold block text-[11px]">Cancellation Note:</span>
            <p className="line-clamp-2">{appointment.cancellationReason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {appointment.hasPrescription ? (
          <Button
            variant="soft"
            size="sm"
            icon={FileText}
            onClick={() => onViewPrescription && onViewPrescription(appointment)}
          >
            View Prescription
          </Button>
        ) : isDoctorView && appointment.status !== 'CANCELLED' ? (
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => onAddPrescription && onAddPrescription(appointment)}
          >
            Add Prescription & Notes
          </Button>
        ) : <div />}

        <div className="flex items-center gap-2 ml-auto">
          {/* Doctor status quick toggle */}
          {isDoctorView && appointment.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCircle}
              onClick={() => onUpdateStatus && onUpdateStatus(appointment.id, 'COMPLETED')}
            >
              Mark Done
            </Button>
          )}

          {/* Cancel button */}
          {isCancellable && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              icon={XCircle}
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
