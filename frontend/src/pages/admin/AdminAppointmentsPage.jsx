import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { appointmentApi } from '../../api/appointmentApi';
import { StatusBadge } from '../../components/appointments/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { Search, Calendar, Filter } from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, searchQuery]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.searchAppointments({
        status: statusFilter || undefined,
        query: searchQuery || undefined,
        size: 50,
      });
      if (res?.success && res.data?.content) {
        setAppointments(res.data.content);
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
      await appointmentApi.updateStatus(id, status, 'Administrative status override');
      loadAppointments();
    } catch (err) {
      alert(err.message || 'Could not update appointment status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Global Appointment Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor all hospital bookings, filter schedules, and manage clinical statuses.
        </p>
      </div>

      {/* Filters row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient, doctor, or reference ID..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Ref / Date</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5">Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-slate-800 block">{appt.appointmentReference}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(appt.appointmentDate)} • {formatTime(appt.startTime)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{appt.patientName}</p>
                      <p className="text-[11px] text-slate-400">{appt.patientEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{appt.doctorName}</p>
                      <p className="text-[11px] text-teal-700">{appt.departmentName}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{appt.consultationType}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(appt.fee)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {appt.status === 'CONFIRMED' && (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                            className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
