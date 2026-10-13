import React from 'react';
import { formatTime } from '../../utils/dateUtils';
import { Clock, AlertCircle } from 'lucide-react';

export const SlotPicker = ({ slots, selectedSlot, onSelectSlot, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
        <Clock className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-xs font-medium">No available slots for this date.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Please choose another day from the calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
        {slots.map((slot, index) => {
          const isSelected = selectedSlot?.startTime === slot.startTime;
          const isAvailable = slot.available;

          return (
            <button
              key={index}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSlot(slot)}
              title={!isAvailable ? slot.reasonUnavailable || 'Slot unavailable' : 'Click to select slot'}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 scale-[1.02]'
                  : isAvailable
                  ? 'bg-teal-50/60 hover:bg-teal-100/70 text-teal-800 border-teal-200/60'
                  : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
              }`}
            >
              <span>{formatTime(slot.startTime)}</span>
              {!isAvailable && (
                <span className="text-[9px] font-normal no-underline text-slate-400">
                  {slot.reasonUnavailable || 'Booked'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
