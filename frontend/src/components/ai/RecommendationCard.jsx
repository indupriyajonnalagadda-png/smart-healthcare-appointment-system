import React from 'react';
import { Sparkles, Building2, CheckCircle2, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DoctorCard } from '../doctors/DoctorCard';
import { getUrgencyColor } from '../../utils/formatters';

export const RecommendationCard = ({ recommendation, onBookDoctor }) => {
  if (!recommendation) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Primary Department & Rationale Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              AI Healthcare Navigation Assessment
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Urgency Triage:</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getUrgencyColor(recommendation.urgency)}`}>
              {recommendation.urgency}
            </span>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 p-5 rounded-2xl bg-teal-50/50 border border-teal-100/70 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-teal-700 tracking-wider">
                Recommended Department
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {recommendation.recommendedDepartment}
              </h3>

              <div className="mt-3 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Target Specialties:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recommendation.recommendedSpecializations?.map((spec, idx) => (
                    <Badge key={idx} variant="primary" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-teal-100/60 text-[11px] text-teal-800 flex items-center gap-1.5 font-medium">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Mapped to Clinic Records</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Clinical Context & Reasoning
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {recommendation.reason}
              </p>
            </div>

            {/* Disclaimer box */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs text-slate-500 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-700">Notice: </span>
                {recommendation.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matching Doctors Section */}
      {recommendation.recommendedDoctors && recommendation.recommendedDoctors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Available Doctors in {recommendation.recommendedDepartment}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualified specialists verified in our clinical database matching your symptoms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendation.recommendedDoctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onBook={onBookDoctor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
