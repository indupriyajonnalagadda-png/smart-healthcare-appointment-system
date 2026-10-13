import React, { useState, useEffect } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Stethoscope, Award, DollarSign, Shield, Phone, FileText } from 'lucide-react';

export const DoctorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    qualifications: '',
    experienceYears: 0,
    consultationFee: 50,
    bio: '',
    consultationModes: 'IN_PERSON,VIDEO',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getMyProfile();
      if (res?.success && res.data) {
        setProfile(res.data);
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          qualifications: res.data.qualifications || '',
          experienceYears: res.data.experienceYears || 0,
          consultationFee: res.data.consultationFee || 50,
          bio: res.data.bio || '',
          consultationModes: res.data.consultationModes || 'IN_PERSON,VIDEO',
        });
      }
    } catch (err) {
      setError('Could not load doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await doctorApi.updateMyProfile({
        ...formData,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      });
      if (res?.success && res.data) {
        setProfile(res.data);
        setMessage('Doctor profile details updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Could not update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={3} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Professional Doctor Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update your public profile, qualifications, consultation fees, and practice modes.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}
        {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                step="5"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Degrees & Qualifications</label>
            <input
              type="text"
              name="qualifications"
              required
              value={formData.qualifications}
              onChange={handleChange}
              placeholder="e.g., MD (Cardiology), FACC - Johns Hopkins"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Practice Bio</label>
            <textarea
              rows={4}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Describe your clinical focus and patient care philosophy..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
