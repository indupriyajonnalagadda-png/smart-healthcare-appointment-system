import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { EmergencyBanner } from '../../components/ai/EmergencyBanner';
import { RecommendationCard } from '../../components/ai/RecommendationCard';
import { BookingModal } from '../../components/appointments/BookingModal';
import { 
  Sparkles, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle, 
  Stethoscope, 
  RotateCcw,
  User,
  HeartPulse
} from 'lucide-react';

export const AiRecommendationPage = () => {
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const samplePrompts = [
    { label: 'Chest Pressure & Left Arm Pain (Emergency)', text: 'Severe crushing chest pain radiating to left arm and shortness of breath.' },
    { label: 'Skin Rash & Itching (Dermatology)', text: 'Persistent itchy red rash and eczema patches on my forearm and neck.' },
    { label: 'Knee Joint Pain (Orthopedics)', text: 'Severe knee pain, swelling, and joint stiffness after playing football.' },
    { label: 'Migraine & Dizziness (Neurology)', text: 'Throbbing headache on one side of my head, visual aura, and dizziness.' },
    { label: 'Child Fever & Cough (Pediatrics)', text: '4-year-old child with persistent nighttime cough, mild fever, and decreased appetite.' },
    { label: 'General Viral Fever (General Med)', text: 'Low-grade fever, sore throat, fatigue, and body aches for two days.' },
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError('Please provide at least 5 characters describing your symptoms.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await aiApi.getDoctorRecommendations({
        symptomDescription: symptoms.trim(),
        age: age ? parseInt(age, 10) : undefined,
        gender,
      });

      if (res?.success && res.data) {
        setRecommendation(res.data);
      } else {
        setError('Could not generate recommendation. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'AI recommendation service error.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = (sampleText) => {
    setSymptoms(sampleText);
    setError(null);
  };

  const handleReset = () => {
    setSymptoms('');
    setAge('');
    setRecommendation(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Clinical Triage Navigator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI-Powered Doctor & Department Recommendation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Describe your health concern in your own words. Our AI evaluates relevant medical departments, filters certified specialists, and highlights potential emergency warning signs.
        </p>
      </div>

      {/* Safety Notice Card */}
      <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Clinical Safety Notice: </span>
          This tool provides navigational guidance to help you select an appropriate medical specialty. It does not provide medical diagnoses, treatment advice, or prescriptions.
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Describe Your Symptoms or Medical Concern *
            </label>
            <textarea
              rows={4}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have had a red itchy rash on my face for a week with small pimples, or experiencing knee pain when climbing stairs..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>

          {/* Quick Sample Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Try sample symptom scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSample(sample.text)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-medium text-slate-600 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Age & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Age (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 32"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Submit & Reset actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={!symptoms && !recommendation}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={loading}
              disabled={!symptoms.trim()}
            >
              Get AI Recommendation
            </Button>
          </div>
        </form>
      </div>

      {/* Emergency Banner if urgency is EMERGENCY */}
      {recommendation?.isEmergency && (
        <EmergencyBanner message={recommendation.emergencyMessage} />
      )}

      {/* Recommendation Results */}
      {recommendation && (
        <RecommendationCard
          recommendation={recommendation}
          onBookDoctor={(doc) => setSelectedDoctorForBooking(doc)}
        />
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          doctor={selectedDoctorForBooking}
          onSuccess={() => navigate('/patient/appointments')}
        />
      )}
    </div>
  );
};
