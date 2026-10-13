import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { departmentApi } from '../../api/departmentApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import { Check, X, Plus, Users, ShieldCheck, Star } from 'lucide-react';

export const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // New Doctor Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    licenseNumber: '',
    qualifications: '',
    experienceYears: 5,
    consultationFee: 75,
    bio: '',
  });

  useEffect(() => {
    loadDepartments();
    loadDoctors();
  }, [statusFilter]);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAllDepartments();
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch {}
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllDoctors({
        approvalStatus: statusFilter || undefined,
        size: 50,
      });
      if (res?.success && res.data?.content) {
        setDoctors(res.data.content);
      } else {
        setDoctors([]);
      }
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (doctorId, approvalStatus) => {
    setMessage(null);
    setError(null);
    try {
      await adminApi.approveDoctor(doctorId, { approvalStatus });
      setMessage(`Doctor account set to ${approvalStatus}.`);
      loadDoctors();
    } catch (err) {
      setError(err.message || 'Could not update approval status.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await adminApi.createDoctor({
        ...formData,
        departmentId: Number(formData.departmentId),
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      });
      setShowCreateModal(false);
      setMessage(`Doctor ${formData.firstName} ${formData.lastName} created successfully.`);
      loadDoctors();
    } catch (err) {
      setError(err.message || 'Could not provision doctor.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Directory & Account Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review professional credentials, approve registrations, and provision doctor accounts.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Provision Doctor Account
        </Button>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        {[
          { label: 'All Doctors', val: '' },
          { label: 'Approved', val: 'APPROVED' },
          { label: 'Pending Review', val: 'PENDING' },
          { label: 'Rejected', val: 'REJECTED' },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.val)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === tab.val
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Doctors Table */}
      {loading ? (
        <SkeletonLoader count={5} type="table" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Fee</th>
                  <th className="px-5 py-3.5">Experience</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center">
                          {doc.firstName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.fullName || `Dr. ${doc.firstName} ${doc.lastName}`}</p>
                          <p className="text-slate-400 text-[11px]">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-teal-700">{doc.departmentName || '-'}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{formatCurrency(doc.consultationFee)}</td>
                    <td className="px-5 py-4 text-slate-600">{doc.experienceYears} Years</td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          doc.approvalStatus === 'APPROVED' ? 'success' : doc.approvalStatus === 'PENDING' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {doc.approvalStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {doc.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleApproval(doc.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Approve Doctor"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {doc.approvalStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleApproval(doc.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Reject Doctor"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Doctor Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Provision New Doctor Account"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">Select Dept</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="MD-XYZ-1234"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee ($) *</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications *</label>
              <input
                type="text"
                required
                placeholder="MD, MBBS, FRCS"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={creating}>
                Create Doctor Account
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
