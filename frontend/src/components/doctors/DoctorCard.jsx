import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Award, Clock, DollarSign, Calendar, Video, MapPin } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export const DoctorCard = ({ doctor, onBook }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-bold text-xl flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
            {doctor.firstName?.[0] || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 truncate">
              {doctor.fullName || `Dr. ${doctor.firstName} ${doctor.lastName}`}
            </h3>
            <p className="text-xs font-semibold text-teal-700 mt-0.5">
              {doctor.departmentName}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-800">{doctor.rating || 4.9}</span>
              <span className="text-slate-400">({doctor.reviewCount || 15} reviews)</span>
            </div>
          </div>
        </div>

        {/* Badges / Specializations */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {doctor.specializations?.map((spec, i) => (
            <Badge key={i} variant="primary" size="sm">
              {spec}
            </Badge>
          ))}
        </div>

        {/* Qualifications and Experience */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{doctor.experienceYears} Years Exp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>30 Min Slots</span>
          </div>
        </div>
      </div>

      {/* Bottom Fee & Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Consultation</span>
          <span className="text-base font-bold text-slate-900">
            {formatCurrency(doctor.consultationFee)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/doctors/${doctor.id}`)}
          >
            Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => (onBook ? onBook(doctor) : navigate(`/doctors/${doctor.id}`))}
          >
            Book
          </Button>
        </div>
      </div>
    </div>
  );
};
