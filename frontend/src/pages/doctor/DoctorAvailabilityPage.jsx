import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, getTodayDateString } from '../../utils/dateUtils';
import { Clock, Calendar, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DoctorAvailabilityPage = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // New Exception state
  const [exceptionDate, setExceptionDate] = useState(getTodayDateString());
  const [exceptionReason, setExceptionReason] = useState('');
  const [addingException, setAddingException] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, profRes] = await Promise.all([
        doctorApi.getMyAvailability(),
        doctorApi.getMyProfile(),
      ]);

      if (profRes?.success && profRes.data) {
        setProfile(profRes.data);
      }

      const existing = (availRes?.success && Array.isArray(availRes.data)) ? availRes.data : [];
      // Initialize full week array
      const mapped = DAYS_OF_WEEK.map((day) => {
        const found = existing.find((item) => item.dayOfWeek === day);
        return {
          dayOfWeek: day,
          startTime: found ? found.startTime : '09:00:00',
          endTime: found ? found.endTime : '17:00:00',
          slotDurationMinutes: found ? found.slotDurationMinutes : 30,
          active: found ? found.active : false,
        };
      });
      setAvailabilities(mapped);
    } catch (err) {
      setError('Could not load availability settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (day) => {
    setAvailabilities((prev) =>
      prev.map((item) => (item.dayOfWeek === day ? { ...item, active: !item.active } : item))
    );
  };

  const handleTimeChange = (day, field, val) => {
    const formatted = val.length === 5 ? `${val}:00` : val;
    setAvailabilities((prev) =>
      prev.map((item) => (item.dayOfWeek === day ? { ...item, [field]: formatted } : item))
    );
  };

  const handleSaveWeeklySchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    setMessage(null);
    setError(null);

    try {
      const res = await doctorApi.updateMyAvailability(availabilities);
      if (res?.success) {
        setMessage('Weekly recurring availability schedule saved successfully.');
      }
    } catch (err) {
      setError(err.message || 'Could not update availability.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddException = async (e) => {
    e.preventDefault();
    if (!exceptionDate) return;
    setAddingException(true);
    setError(null);

    try {
      await doctorApi.addException({
        exceptionDate,
        reason: exceptionReason.trim() || 'Blocked by doctor',
        allDay: true,
      });
      setExceptionReason('');
      setMessage(`Blocked date added for ${formatDate(exceptionDate)}.`);
      // Reload profile to refresh exceptions list
      const profRes = await doctorApi.getMyProfile();
      if (profRes?.success && profRes.data) setProfile(profRes.data);
    } catch (err) {
      setError(err.message || 'Could not add exception.');
    } finally {
      setAddingException(false);
    }
  };

  const handleDeleteException = async (exceptionId) => {
    try {
      await doctorApi.deleteException(exceptionId);
      setMessage('Blocked date removed successfully.');
      const profRes = await doctorApi.getMyProfile();
      if (profRes?.success && profRes.data) setProfile(profRes.data);
    } catch (err) {
      setError('Could not delete exception.');
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Availability & Shift Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Define recurring weekly shift hours, consultation durations, and block holidays or leaves.
        </p>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

      {/* Weekly Schedule Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Weekly Recurring Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Toggle working days and shift hours (30 min slots).</p>
          </div>
        </div>

        <form onSubmit={handleSaveWeeklySchedule} className="space-y-3">
          <div className="space-y-2">
            {availabilities.map((dayItem) => {
              const startVal = dayItem.startTime ? dayItem.startTime.substring(0, 5) : '09:00';
              const endVal = dayItem.endTime ? dayItem.endTime.substring(0, 5) : '17:00';

              return (
                <div
                  key={dayItem.dayOfWeek}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    dayItem.active
                      ? 'bg-teal-50/40 border-teal-200'
                      : 'bg-slate-50/60 border-slate-200/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:w-44">
                    <input
                      type="checkbox"
                      id={`day-${dayItem.dayOfWeek}`}
                      checked={dayItem.active}
                      onChange={() => handleToggleDay(dayItem.dayOfWeek)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`day-${dayItem.dayOfWeek}`}
                      className="text-xs font-bold text-slate-800 cursor-pointer capitalize"
                    >
                      {dayItem.dayOfWeek.toLowerCase()}
                    </label>
                  </div>

                  {dayItem.active ? (
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">From:</span>
                        <input
                          type="time"
                          value={startVal}
                          onChange={(e) => handleTimeChange(dayItem.dayOfWeek, 'startTime', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">To:</span>
                        <input
                          type="time"
                          value={endVal}
                          onChange={(e) => handleTimeChange(dayItem.dayOfWeek, 'endTime', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={savingSchedule}>
              Save Weekly Schedule
            </Button>
          </div>
        </form>
      </div>

      {/* Blocked Dates / Availability Exceptions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Blocked Dates & Leave Exceptions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Block specific holidays or absence dates from patient booking.
          </p>
        </div>

        {/* Add Exception form */}
        <form onSubmit={handleAddException} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-48">
            <input
              type="date"
              required
              min={getTodayDateString()}
              value={exceptionDate}
              onChange={(e) => setExceptionDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
          <div className="w-full flex-1">
            <input
              type="text"
              placeholder="Reason (e.g., Annual Leave / Conference)"
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" icon={Plus} loading={addingException}>
            Block Date
          </Button>
        </form>

        {/* List of blocked dates */}
        <div className="space-y-2">
          {profile?.exceptions && profile.exceptions.length > 0 ? (
            profile.exceptions.map((ex) => (
              <div
                key={ex.id}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{formatDate(ex.exceptionDate)}</span>
                  <span className="text-slate-500">{ex.reason || 'Blocked'} (All Day)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteException(ex.id)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic py-2">No upcoming blocked dates recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};
